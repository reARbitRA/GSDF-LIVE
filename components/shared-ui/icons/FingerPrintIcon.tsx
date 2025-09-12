import React from 'react';

const FingerPrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.588 8.188a7.5 7.5 0 0 1-16.324 0c-.23-1.002-.341-2.036-.341-3.082 0-3.328 1.158-6.424 3.098-8.892a7.5 7.5 0 0 1 3.58-2.525ZM10.5 10.5a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 0-1.5H11.25a.75.75 0 0 0-.75.75Zm.75 3.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export default FingerPrintIcon;
