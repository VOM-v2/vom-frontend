// Central place to decide which backend origin to hit.
// - In local dev, defaults to http://localhost:8080
// - In production, defaults to the same origin as the frontend
// - Can be overridden with REACT_APP_BACKEND_ORIGIN

const resolvedBackendOrigin =
  process.env.REACT_APP_BACKEND_ORIGIN ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
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

