import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against unhandled rejections from third-party Web3 browser extensions (like MetaMask, Phantom, etc.)
if (typeof window !== 'undefined') {
  const isWeb3OrExtensionError = (reason: any, filename?: string) => {
    let combinedStr = '';
    if (typeof reason === 'string') {
      combinedStr += ' ' + reason;
    } else if (reason && typeof reason === 'object') {
      combinedStr += ' ' + (reason.message || '') + ' ' + (reason.stack || '') + ' ' + (reason.name || '');
      try {
        combinedStr += ' ' + JSON.stringify(reason);
      } catch {
        // Stringify fallback
      }
    }
    const lower = combinedStr.toLowerCase();
    const fileLower = (filename || '').toLowerCase();

    return (
      lower.includes('metamask') ||
      lower.includes('ethereum') ||
      lower.includes('evmask') ||
      lower.includes('failed to connect') ||
      lower.includes('user rejected') ||
      lower.includes('wallet') ||
      lower.includes('solana') ||
      lower.includes('phantom') ||
      lower.includes('inpage') ||
      lower.includes('evm') ||
      lower.includes('json-rpc') ||
      lower.includes('rpc error') ||
      lower.includes('error 0') ||
      lower.includes('unexpected error') ||
      lower.includes('code":0') ||
      lower.includes('code": 0') ||
      lower.includes('failed to connect to metamask') ||
      fileLower.includes('chrome-extension') ||
      fileLower.includes('moz-extension') ||
      fileLower.includes('inpage.js')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWeb3OrExtensionError(event?.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const filename = event?.filename || '';
    if (isWeb3OrExtensionError(event?.message || event?.error, filename)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
