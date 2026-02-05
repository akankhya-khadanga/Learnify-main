// ============================================================
// IMPORTS - MUST BE AT THE VERY TOP (ESM import hoisting)
// ============================================================
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { initSentry } from "./lib/sentry";

// Initialize Sentry
initSentry();

// ============================================================
// APPLICATION INITIALIZATION
// ============================================================
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element #root not found in DOM");
  }

  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Application error:", error);
      }}
    >
      <App />
    </ErrorBoundary>
  );

} catch (error) {
  console.error("Failed to initialize application:", error);

  // Show user-friendly error in the DOM
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; background: #0F1115; min-height: 100vh; color: #E6E8ED;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h1 style="color: #C9B458; font-size: 3rem; font-weight: 900; margin-bottom: 1rem;">
          ⚠️ Learnify Failed to Load
        </h1>
        
        <p style="color: #C27BA0; font-size: 1.25rem; margin-bottom: 2rem;">
          The application encountered a critical error during initialization.
        </p>
        
        <div style="background: #151823; border: 4px solid #C9B458; border-radius: 8px; padding: 24px; margin-bottom: 2rem;">
          <h2 style="color: #6DAEDB; font-size: 1.5rem; margin-bottom: 1rem;">Error Details:</h2>
          <pre style="background: #1B1F2E; padding: 16px; border-radius: 4px; color: #C27BA0; overflow-x: auto; font-family: 'Courier New', monospace;">${error instanceof Error ? error.message : String(error)}</pre>
          ${error instanceof Error && error.stack ? `
            <details style="margin-top: 16px;">
              <summary style="color: #9CA3AF; cursor: pointer; margin-bottom: 8px;">Stack Trace</summary>
              <pre style="background: #1B1F2E; padding: 16px; border-radius: 4px; color: #9CA3AF; overflow-x: auto; font-size: 0.875rem; font-family: 'Courier New', monospace;">${error.stack}</pre>
            </details>
          ` : ''}
        </div>
        
        <div style="background: #1B1F2E; border: 2px solid #6DAEDB; border-radius: 8px; padding: 24px; margin-bottom: 2rem;">
          <h3 style="color: #6DAEDB; margin-bottom: 1rem;">💡 Quick Fixes:</h3>
          <ol style="color: #E6E8ED; line-height: 1.8; margin-left: 20px;">
            <li><strong>Hard Refresh:</strong> Press <code style="background: #151823; padding: 2px 8px; border-radius: 4px; color: #C9B458;">Ctrl + Shift + R</code> (Windows) or <code style="background: #151823; padding: 2px 8px; border-radius: 4px; color: #C9B458;">Cmd + Shift + R</code> (Mac)</li>
            <li><strong>Clear Cache:</strong> Open DevTools (F12) → Application → Clear Storage → Clear site data</li>
            <li><strong>Check Console:</strong> Open DevTools (F12) → Console tab for more details</li>
            <li><strong>Restart Server:</strong> If running locally, restart the development server</li>
          </ol>
        </div>
        
        <div style="display: flex; gap: 16px;">
          <button 
            onclick="location.reload(true)" 
            style="flex: 1; padding: 16px 32px; background: #C9B458; color: #000; border: 4px solid #000; border-radius: 8px; font-weight: 900; font-size: 1.125rem; cursor: pointer; box-shadow: 4px 4px 0px rgba(0,0,0,0.5);"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='6px 6px 0px rgba(0,0,0,0.5)'"
            onmouseout="this.style.transform=''; this.style.boxShadow='4px 4px 0px rgba(0,0,0,0.5)'"
          >
            🔄 Reload Page
          </button>
          
          <button 
            onclick="window.location.href='/'" 
            style="flex: 1; padding: 16px 32px; background: transparent; color: #C9B458; border: 4px solid #C9B458; border-radius: 8px; font-weight: 900; font-size: 1.125rem; cursor: pointer;"
            onmouseover="this.style.background='rgba(201, 180, 88, 0.1)'"
            onmouseout="this.style.background='transparent'"
          >
            🏠 Go Home
          </button>
        </div>
        
        <p style="color: #9CA3AF; margin-top: 2rem; text-align: center; font-size: 0.875rem;">
          Need help? Check the browser console (F12) for more technical details.
        </p>
      </div>
    </div>
  `;
}
