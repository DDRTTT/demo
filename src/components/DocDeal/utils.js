export function getJsonFromSession(key) {
  return JSON.parse(sessionStorage.getItem(key) || '{}');
}

export function getValFromSession(key) {
  return sessionStorage.getItem(key);
}
