// Server-only helpers for the shared admin access code.
// The code itself is NEVER sent to the client and never compared client-side.

const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function enc(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const secret = process.env["ADMIN_VERIFY_SECRET"];
  if (!secret) throw new Error("Admin verification is not configured (missing ADMIN_VERIFY_SECRET).");
  const key = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc(payload)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns true when the submitted code matches the configured ADMIN_ACCESS_CODE. */
export function checkAdminCode(code: string): boolean {
  const expected = process.env["ADMIN_ACCESS_CODE"];
  if (!expected) throw new Error("Admin access code is not configured on the server.");
  return safeEqual(code, expected);
}

/** Mints a short-lived signed token bound to the user id. */
export async function issueAdminToken(userId: string): Promise<string> {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${exp}.${await sign(payload)}`;
}

/** Throws unless the request carries a valid, unexpired admin token for this user. */
export async function requireAdminVerified(userId: string, token: string | null | undefined): Promise<void> {
  if (!token) throw new Error("Admin code required.");
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!expRaw || !sig || !Number.isFinite(exp)) throw new Error("Admin code required.");
  if (Date.now() > exp) throw new Error("Admin code required.");
  const expected = await sign(`${userId}.${exp}`);
  if (!safeEqual(sig, expected)) throw new Error("Admin code required.");
}
