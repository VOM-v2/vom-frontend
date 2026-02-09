/**
 * Cookie utility functions
 */

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

/**
 * Get XSRF token from cookie
 * Spring Boot typically stores XSRF token in XSRF-TOKEN cookie
 * @returns {string|null} XSRF token or null if not found
 */
export function getXsrfToken() {
  return getCookie('XSRF-TOKEN');
}
