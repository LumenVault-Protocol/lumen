import React from 'react';
import ReactDOM from 'react-dom/client';

const rootEl = document.getElementById('root');

function showError(title: string, msg: string) {
  if (rootEl) {
    rootEl.innerHTML = `<div style="color:#ff4444;padding:40px;font-family:monospace;background:#111;min-height:100vh;white-space:pre-wrap">
      <h1 style="margin-bottom:16px">${title}</h1><pre>${msg}</pre></div>`;
  }
  document.body.style.background = '#111';
}

if (!rootEl) {
  showError('ERROR', '#root element not found in DOM');
} else {
  import('./App')
    .then(({ default: App }) => {
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    })
    .catch((err) => {
      showError('Module Load Error', err?.message || String(err));
    });
}