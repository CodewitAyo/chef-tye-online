export type TierName = "Member" | "VIP" | "Elite Circle";

export function tierFor(points: number): {
  name: TierName;
  min: number;
  next: number | null;
  benefit: string;
} {
  if (points >= 200)
    return {
      name: "Elite Circle",
      min: 200,
      next: null,
      benefit: "Priority delivery, 10% off, exclusive invites, custom meal requests, end-of-year prize.",
    };
  if (points >= 100)
    return {
      name: "VIP",
      min: 100,
      next: 200,
      benefit: "Free main meals, birthday gift, priority orders, surprise discounts.",
    };
  return { name: "Member", min: 0, next: 100, benefit: "Free plantain, drinks and member-only discounts." };
}

export function tierNameForPoints(points: number): TierName {
  return tierFor(points).name;
}

export function pointsForSubtotalNgn(subtotalNgn: number): number {
  if (!Number.isFinite(subtotalNgn) || subtotalNgn <= 0) return 0;
  return Math.floor(subtotalNgn / 1000);
}

export const ORDER_SOURCES = [
  { value: "online", label: "Online (Chowdeck etc.)" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "offline", label: "Offline / in person" },
  { value: "manual_past", label: "Manually entered (past order)" },
  { value: "other", label: "Other" },
] as const;
