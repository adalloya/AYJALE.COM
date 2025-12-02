import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary';

console.log('Application starting...');

// Global error handler for startup issues
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error('Global error:', msg, error);
  document.body.innerHTML += `<div style="color:red; padding:20px;">
    <h1>Startup Error</h1>
    <p>${msg}</p>
    <pre>${error?.stack || ''}</pre>
  </div>`;
  return false;
};

window.onunhandledrejection = function (event) {
  console.error('Unhandled rejection:', event.reason);
  document.body.innerHTML += `<div style="color:red; padding:20px;">
    <h1>Unhandled Promise Rejection</h1>
    <p>${event.reason?.message || event.reason}</p>
    <pre>${event.reason?.stack || ''}</pre>
  </div>`;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('FATAL: Root element not found!');
  document.body.innerHTML = '<div style="color:red; padding:20px;"><h1>FATAL ERROR</h1><p>Root element with id "root" not found in index.html</p></div>';
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>
  </ErrorBoundary>,
)
