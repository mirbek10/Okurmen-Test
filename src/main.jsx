import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'

const CHUNK_RELOAD_KEY = 'okurmen-chunk-reload';
window.addEventListener('vite:preloadError', (event) => {
  const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
  if (Date.now() - lastReload > 30_000) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
    event.preventDefault();
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


