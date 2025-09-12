import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GatewayScene from './GatewayScene';
import { describe, it, expect, jest } from '@jest/globals';

// Mock child components to isolate tests to GatewayScene and DigitalIdCard logic
jest.mock('./NeuralWeaveAnimation', () => ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  // Immediately call the completion callback to simulate animation end
  React.useEffect(() => {
    onAnimationComplete();
  }, [onAnimationComplete]);
  return <div data-testid="neural-weave-animation">Animating...</div>;
});

describe('GatewayScene and DigitalIdCard', () => {
  it('renders the Digital ID Card by default', () => {
    render(<GatewayScene onLoginSuccess={jest.fn()} />);
    expect(screen.getByLabelText(/Operator ID or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Authenticate/i })).toBeInTheDocument();
  });

  it('shows validation error for empty identifier', () => {
    render(<GatewayScene onLoginSuccess={jest.fn()} />);
    const authButton = screen.getByRole('button', { name: /Authenticate/i });
    fireEvent.click(authButton);
    expect(screen.getByText('Identifier cannot be empty.')).toBeInTheDocument();
  });

  it('shows validation error for empty password in password mode', () => {
    render(<GatewayScene onLoginSuccess={jest.fn()} />);
    const identifierInput = screen.getByLabelText(/Operator ID or Email/i);
    const authButton = screen.getByRole('button', { name: /Authenticate/i });

    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.click(authButton);
    
    expect(screen.getByText('Password field is required.')).toBeInTheDocument();
    // Check for amber "contradiction" style
    expect(screen.getByRole('alert')).toHaveClass('border-amber-500/50');
  });

  it('switches to magic-link mode and validates email', () => {
    render(<GatewayScene onLoginSuccess={jest.fn()} />);
    const magicLinkTab = screen.getByRole('tab', { name: /Magic Link/i });
    fireEvent.click(magicLinkTab);
    
    const emailInput = screen.getByLabelText(/Email address for magic link/i);
    const sendButton = screen.getByRole('button', { name: /Send Magic Link/i });

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('A valid email is required for magic link.')).toBeInTheDocument();
  });

  it('displays a magenta "manipulation" error for a known bad password', async () => {
    render(<GatewayScene onLoginSuccess={jest.fn()} />);
    const identifierInput = screen.getByLabelText(/Operator ID or Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const authButton = screen.getByRole('button', { name: /Authenticate/i });

    fireEvent.change(identifierInput, { target: { value: 'operator1' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(authButton);

    await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Authentication failed: Signal manipulation detected.');
        expect(alert).toHaveClass('border-fuchsia-500/50');
    });
  });

  it('calls onLoginSuccess after successful authentication', async () => {
    const handleLoginSuccess = jest.fn();
    render(<GatewayScene onLoginSuccess={handleLoginSuccess} />);

    const identifierInput = screen.getByLabelText(/Operator ID or Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const authButton = screen.getByRole('button', { name: /Authenticate/i });

    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'goodpassword' } });
    fireEvent.click(authButton);

    expect(screen.getByRole('button', { name: /Authenticate/i })).toBeDisabled();

    // The mock for NeuralWeaveAnimation calls onLoginSuccess immediately after it appears.
    // So, we wait for the login to "succeed" and the animation to appear.
    await waitFor(() => {
        expect(screen.getByTestId('neural-weave-animation')).toBeInTheDocument();
    });

    // Then we check if the callback was fired.
    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
