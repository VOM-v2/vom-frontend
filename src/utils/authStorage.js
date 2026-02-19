/**
 * 인증 정보 저장소
 * - accessToken: localStorage (영구, 새로고침 유지)
 * - nickname: sessionStorage (탭 세션만, 미니홈피 URL /mini-home/{nickname}용)
 * - userId는 JWT payload에서 디코딩해 사용 (표준·보안 권장)
 */

const KEY_ACCESS_TOKEN = 'vom_access_token';
const KEY_NICKNAME = 'vom_nickname';

export function getAccessToken() {
  try {
    return localStorage.getItem(KEY_ACCESS_TOKEN);
  } catch (_) {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token != null) {
      localStorage.setItem(KEY_ACCESS_TOKEN, String(token));
    } else {
      localStorage.removeItem(KEY_ACCESS_TOKEN);
    }
  } catch (_) {
    // ignore
  }
}

/**
 * JWT payload에서 사용자 ID 추출 (sub 또는 userId 클레임)
 * localStorage에 userId를 저장하지 않고 토큰에서만 읽음.
 */
export function getUserIdFromToken() {
  const token = getAccessToken();
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const decoded = JSON.parse(atob(padded));
    return decoded.sub ?? decoded.userId ?? decoded.id ?? null;
  } catch (_) {
    return null;
  }
}

/**
 * 로그인/리프레시 응답에서 accessToken + nickname 저장
 * nickname은 sessionStorage에만 저장 (미니홈피 경로용)
 */
export function setAuthFromResponse(data) {
  const token = data?.accessToken ?? data?.access_token;
  if (token != null) {
    setAccessToken(token);
  }
  const user = data?.userDto ?? data?.user;
  if (user?.nickname != null) {
    try {
      sessionStorage.setItem(KEY_NICKNAME, String(user.nickname));
    } catch (_) {
      // ignore
    }
  }
}

export function getNickname() {
  try {
    return sessionStorage.getItem(KEY_NICKNAME);
  } catch (_) {
    return null;
  }
}

export function setNickname(nickname) {
  try {
    if (nickname != null) {
      sessionStorage.setItem(KEY_NICKNAME, String(nickname));
    } else {
      sessionStorage.removeItem(KEY_NICKNAME);
    }
  } catch (_) {
    // ignore
  }
}

/**
 * 로그아웃 시 accessToken(localStorage), nickname(sessionStorage) 제거
 */
export function clearAuth() {
  try {
    localStorage.removeItem(KEY_ACCESS_TOKEN);
    sessionStorage.removeItem(KEY_NICKNAME);
  } catch (_) {
    // ignore
  }
}
