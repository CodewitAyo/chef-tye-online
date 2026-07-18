import meal2Asset from "@/assets/meal-2.png.asset.json";
import superstarAsset from "@/assets/superstar-meal.png.asset.json";
import lustAsset from "@/assets/lust.png.asset.json";
import menuFlyerAsset from "@/assets/menu-flyer.png.asset.json";

export type MenuItem = {
  id: string;
  name: string;
  price: string;
  section: "Chef Tye Pasta" | "Mains" | "Extras";
  tag?: string;
  short: string;
  full: string;
  image?: string;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "holy-grail",
    name: "Holy Grail",
    price: "₦5,700",
    section: "Chef Tye Pasta",
    tag: "Signature",
    image: meal2Asset.url,
    short: "Chef Tye's signature stir-fry pasta with chicken.",
    full: "The plate that put Chef Tye on the map. Stir-fry pasta layered with house spices, a punchy sauce, and shredded chicken. Comfort food that punches back.",
  },
  {
    id: "holy-grail-pro",
    name: "Holy Grail Pro",
    price: "₦6,700",
    section: "Chef Tye Pasta",
    image: meal2Asset.url,
    short: "The Holy Grail with more chicken.",
    full: "Same Holy Grail you love, upgraded. Shredded chicken through the pasta plus a full piece of chicken on top for the days you're not playing.",
  },
  {
    id: "asap",
    name: "ASAP",
    price: "₦8,000",
    section: "Chef Tye Pasta",
    tag: "Fan Favourite",
    image: superstarAsset.url,
    short: "Goat-meat pasta, asun-style.",
    full: "Chef Tye's asun-style goat pasta. Smoky, peppery, with tender goat that fell apart before it hit the plate. Bold enough to end a conversation.",
  },
  {
    id: "obiageli",
    name: "Obiageli",
    price: "₦6,500",
    section: "Chef Tye Pasta",
    image: menuFlyerAsset.url,
    short: "Native pasta with smoked fish, egg and ponmo.",
    full: "A Nigerian native-style pasta built the way your aunty would want it. Smoked fish, boiled egg, ponmo, and the kind of stew flavour that reminds you of home.",
  },
  {
    id: "rich-flex",
    name: "Rich Flex",
    price: "₦6,000",
    section: "Mains",
    image: menuFlyerAsset.url,
    short: "Chef Tye's four-layered chicken sandwich.",
    full: "Four layers of chicken, sauce, and toasted bread stacked like it owes you money. A proper sandwich, not a snack.",
  },
  {
    id: "lust",
    name: "Lust",
    price: "₦6,000",
    section: "Mains",
    tag: "Comfort Plate",
    image: lustAsset.url,
    short: "Chicken potato stir-fry with vegetables in a rich brown sauce.",
    full: "Sweet potato, green beans, and carrots stir-fried with chicken in a deep, glossy brown sauce. The kind of plate you eat slowly on purpose.",
  },
  {
    id: "ecstasy",
    name: "Ecstasy",
    price: "₦15,000",
    section: "Mains",
    image: menuFlyerAsset.url,
    short: "6 pieces of Chef Tye's signature chicken.",
    full: "Six pieces of Chef Tye's signature chicken. Marinated overnight, cooked to that specific brown that lets you know somebody cared. Made to share (or not).",
  },
  {
    id: "extra-chicken",
    name: "Extra Chicken",
    price: "₦2,700",
    section: "Extras",
    image: menuFlyerAsset.url,
    short: "Add-on piece of chicken.",
    full: "One extra piece of Chef Tye's signature chicken to add to any order.",
  },
];

export const FULL_MENU_IMAGE = menuFlyerAsset.url;

export function findMenuItem(id: string | undefined | null): MenuItem | null {
  if (!id) return null;
  return MENU_ITEMS.find((m) => m.id === id) ?? null;
}
