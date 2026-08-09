import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inquirySchema = z.object({
  type: z.enum(["contact", "donation", "catering"]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
  amount_ngn: z.number().int().min(0).max(1_000_000_000).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inquirySchema.parse(data))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("@/lib/supabase-public.server");
    const supabase = createPublicServerClient();
    const { error } = await supabase.from("inquiries").insert({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
      amount_ngn: data.amount_ngn ?? null,
    });
    if (error) {
      console.error("[inquiries] insert failed", error);
      throw new Error("Could not send message. Please try again shortly.");
    }
    return { ok: true as const };
  });
