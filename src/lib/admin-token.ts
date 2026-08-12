// Client-side holder for the short-lived "admin verified" token.
// Kept in sessionStorage: cleared on tab close and on every fresh sign-in.

const KEY = "ct-admin-verified";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
