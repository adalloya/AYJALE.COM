import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary';

console.log('Application starting...');
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>
  </ErrorBoundary>,
)
