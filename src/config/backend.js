// Central place to decide which backend origin to hit.
// 
// Development:
//   - Uses proxy (relative URLs) by default to avoid CORS preflight issues
//   - Proxy is configured in package.json: "proxy": "http://localhost:8080"
//   - Set REACT_APP_USE_PROXY=false to use absolute URLs instead
//
// Production:
//   - Set REACT_APP_BACKEND_ORIGIN environment variable to your backend URL
//   - Example: REACT_APP_BACKEND_ORIGIN=https://api.yourdomain.com
//   - If not set, defaults to same origin as frontend (requires backend CORS config)
//
// Backend CORS Configuration Required:
//   - Backend must allow your frontend origin in CORS settings
//   - Example: allowedOrigins("https://yourdomain.com", "http://localhost:3000")

// Central place to decide which backend origin to hit.
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const resolvedBackendOrigin =
  process.env.REACT_APP_BACKEND_ORIGIN ||
  (isDevelopment
    ? 'http://localhost:8080'
    : typeof window !== 'undefined'
      ? window.location.origin
      : '');

export function getBackendOrigin() {
  return resolvedBackendOrigin;
}

export function buildBackendUrl(path) {
  if (!path.startsWith('/')) {
    // ensure leading slash
    // eslint-disable-next-line no-param-reassign
    path = `/${path}`;
  }

  return `${resolvedBackendOrigin}${path}`;
}

