export const SITE_NAME = "Chef Tye";
export const SITE_TAGLINE = "Private Chef, Lagos";
export const SITE_URL = "https://cheftye.lovable.app";

// Ordering platform (Chowdeck) — general storefront, used for all site-wide
// "Order Now" CTAs. Per-item deep links are a separate, deferred effort (CT-FUNC-001).
export const ORDER_URL = "https://chowdeck.com/store/olowora/restaurants/chef-tyexklx4w";
export const ORDER_PROVIDER_DISPLAY = "Chef Tye on Chowdeck";

// Instagram / X
export const INSTAGRAM_PRIMARY = "https://instagram.com/cheftye_";
export const INSTAGRAM_HANDLE_PRIMARY = "@cheftye_";
export const X_PRIMARY = "https://x.com/tye_chef";
export const X_HANDLE_PRIMARY = "@tye_chef";

// Contact
export const CONTACT_PHONE_DISPLAY = "08118615254";
export const CONTACT_PHONE_TEL = "+2348118615254";
export const WHATSAPP_DISPLAY = "+234 811 861 5254";
export const WHATSAPP_URL = "https://wa.me/2348118615254";
export const CONTACT_EMAIL = "Adebola.tye@gmail.com";
export const LOCATION = "Lagos, Nigeria";
export const LOCATION_SHORT = "Lagos, NG";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Lagos%2C+Nigeria";

// Phone fields: digits, spaces, and + - ( ) only, at least 7 digits total.
export const PHONE_PATTERN = /^[+()\d][\d\s\-()]{6,39}$/;
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true; // optional fields stay optional
  const digitCount = (trimmed.match(/\d/g) ?? []).length;
  return PHONE_PATTERN.test(trimmed) && digitCount >= 7;
}

// Strips anything that can never legally appear in a phone number (letters, @, #, etc.)
// as the user types, so it's blocked at input time rather than only caught on submit.
const PHONE_DISALLOWED_CHARS = /[^\d+()\-\s]/g;
export function sanitizePhoneInput(value: string): string {
  return value.replace(PHONE_DISALLOWED_CHARS, "").slice(0, 40);
}
