import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Suppress unnecessary console messages
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// Filter out unnecessary console messages
console.log = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('Download the React DevTools') ||
    message.includes('content script loaded') ||
    message.includes('[vite] connecting') ||
    message.includes('[vite] connected')
  ) {
    return;
  }
  originalLog(...args);
};

// Suppress WebSocket connection errors to port 8081 (external tools)
const originalErrorHandler = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (typeof message === 'string' && (
    message.includes('WebSocket connection to \'ws://localhost:8081/\'') ||
    message.includes('refresh.js')
  )) {
    return true; // Suppress the error
  }
  if (originalErrorHandler) {
    return originalErrorHandler(message, source, lineno, colno, error);
  }
  return false;
};

// Suppress unhandled promise rejections for WebSocket 8081
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || '';
  if (reason.includes('8081') || reason.includes('refresh.js')) {
    event.preventDefault();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for Offline Playback (silently)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        // Service worker registered successfully (silent)
      })
      .catch(() => {
        // Service worker registration failed (silent)
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);