/**
 * Minimal structured logger. Emits one JSON object per event so logs are machine-parseable
 * and so a future error-tracking sink (Sentry, OTel) can be attached in one place.
 * Never log secrets or raw user documents: callers pass only summaries/ids.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
  ts: string;
  level: LogLevel;
  event: string;
  context?: Record<string, unknown>;
}

type Sink = (e: LogEvent) => void;
let sink: Sink = (e) => {
  const line = JSON.stringify(e);
  if (e.level === 'error') console.error(line);
  else if (e.level === 'warn') console.warn(line);
  else console.log(line);
};

/** Replace the output sink (used by tests and by future error-tracking integration). */
export const setLogSink = (next: Sink | null): void => { sink = next ?? (() => {}); };

const serialiseError = (err: unknown) =>
  err instanceof Error ? { name: err.name, message: err.message } : { message: String(err) };

const emit = (level: LogLevel, event: string, context?: Record<string, unknown>) =>
  sink({ ts: new Date().toISOString(), level, event, context });

export const logger = {
  debug: (event: string, context?: Record<string, unknown>) => emit('debug', event, context),
  info: (event: string, context?: Record<string, unknown>) => emit('info', event, context),
  warn: (event: string, context?: Record<string, unknown>) => emit('warn', event, context),
  error: (event: string, err?: unknown, context?: Record<string, unknown>) =>
    emit('error', event, { ...(context ?? {}), error: err === undefined ? undefined : serialiseError(err) }),
};
