export type Intent = {
  id: string;
  match: RegExp;
  answer: string;
  actions?: { label: string; to?: string; href?: string }[];
};

const ORDER_URL = "https://chowdeck.com/lagos/chef-tye";
const WHATSAPP = "https://wa.me/2348118615254";

export const INTENTS: Intent[] = [
  {
    id: "menu",
    match: /\b(menu|food|dishes|meals?|pasta|holy grail|asap|obiageli|rich flex|lust|ecstasy)\b/i,
    answer:
      "Here's the menu — Holy Grail pasta, ASAP (asun-style goat), Obiageli (native pasta), Rich Flex sandwich, Lust (chicken potato stir-fry) and Ecstasy chicken. All hand-prepared by Chef Tye.",
    actions: [
      { label: "See the Menu", to: "/menu" },
      { label: "Order on Chowdeck", href: ORDER_URL },
    ],
  },
  {
    id: "order",
    match: /\b(order|delivery|chowdeck|how (do|can) i (order|buy))\b/i,
    answer: "Order Chef Tye on Chowdeck for delivery, or reach us on WhatsApp / X (@tye_chef) for catering & private events.",
    actions: [
      { label: "Order on Chowdeck", href: ORDER_URL },
      { label: "WhatsApp", href: WHATSAPP },
    ],
  },
  {
    id: "loyalty",
    match: /\b(loyalty|points?|rewards?|earn|tier|vip|elite)\b/i,
    answer:
      "Chef Tye Family loyalty: earn 1 point per ₦1,000 spent (subtotal only).\n\n• Member (0–99): free plantain/drink, ₦3,000 off at 60 pts.\n• VIP (100–199): free main meal, birthday gift, priority orders.\n• Elite Circle (200+): 10% off, custom meal requests, end-of-year prize.",
    actions: [
      { label: "Join The Family", to: "/join" },
      { label: "Create Account", to: "/auth" },
    ],
  },
  {
    id: "signup",
    match: /\b(sign ?up|create account|register|join|make an account)\b/i,
    answer: "Creating a free account takes 30 seconds. You'll start earning points on your next order.",
    actions: [{ label: "Create Free Account", to: "/auth" }],
  },
  {
    id: "signin",
    match: /\b(sign ?in|log ?in|login|access my account)\b/i,
    answer: "Sign in with the email and password you used to join.",
    actions: [{ label: "Sign In", to: "/auth" }],
  },
  {
    id: "reset",
    match: /\b(forgot|reset).{0,10}(password|pw)\b/i,
    answer: "No problem — enter your email on the sign-in page and we'll send a reset link.",
    actions: [{ label: "Reset password", to: "/auth" }],
  },
  {
    id: "dashboard",
    match: /\b(dashboard|my (account|points|rewards)|account settings)\b/i,
    answer: "Your dashboard shows current points, tier, lifetime points, available rewards and order history.",
    actions: [{ label: "Open Dashboard", to: "/account" }],
  },
  {
    id: "charity",
    match: /\b(feed the streets|charity|donate|donation|give back)\b/i,
    answer: "Feed The Streets is Chef Tye's December campaign — hot meals for vulnerable kids in Lagos.",
    actions: [
      { label: "See the campaign", to: "/charity" },
      { label: "Donate now", to: "/donate" },
    ],
  },
  {
    id: "contact",
    match: /\b(contact|talk|reach|catering|book|whatsapp|email|phone)\b/i,
    answer: "Reach Chef Tye directly on WhatsApp, X (@tye_chef), or via the contact form.",
    actions: [
      { label: "Contact page", to: "/contact" },
      { label: "WhatsApp", href: WHATSAPP },
    ],
  },
  {
    id: "help",
    match: /^(hi|hello|hey|help|start|what can you do)/i,
    answer:
      "Hey! I'm Superstar, Chef Tye's assistant. Ask me about the menu, ordering, loyalty & rewards, Feed The Streets, contact/catering, or your account.",
    actions: [
      { label: "See Menu", to: "/menu" },
      { label: "Loyalty", to: "/join" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function matchIntent(text: string): Intent | null {
  const t = text.trim();
  if (!t) return null;
  for (const intent of INTENTS) if (intent.match.test(t)) return intent;
  return null;
}
