// Storage adapter for the Supabase auth session.
//
// Default: the session lives in sessionStorage, so it survives a page refresh
// but is gone once the tab/browser is closed.
// "Keep me signed in": the session lives in localStorage and persists across
// browser restarts.

const MODE_KEY = "ct-auth-persist";

export type AuthPersistMode = "local" | "session";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getAuthPersistMode(): AuthPersistMode {
  if (!hasWindow()) return "session";
  try {
    return window.localStorage.getItem(MODE_KEY) === "local" ? "local" : "session";
  } catch {
    return "session";
  }
}

/** Call this BEFORE signing in so Supabase writes the session to the right store. */
export function setAuthPersistMode(mode: AuthPersistMode) {
  if (!hasWindow()) return;
  try {
    if (mode === "local") window.localStorage.setItem(MODE_KEY, "local");
    else window.localStorage.removeItem(MODE_KEY);
  } catch {
    /* ignore */
  }
}

export const authStorage = {
  getItem(key: string): string | null {
    if (!hasWindow()) return null;
    try {
      return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (!hasWindow()) return;
    try {
      if (getAuthPersistMode() === "local") {
        window.sessionStorage.removeItem(key);
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      /* ignore */
    }
  },
  removeItem(key: string): void {
    if (!hasWindow()) return;
    try {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
