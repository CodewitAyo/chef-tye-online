import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const codeInput = z.object({ code: z.string().min(1).max(200) });

export const verifyAdminCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => codeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error("Admin check failed.");
    if (isAdmin !== true) throw new Error("Forbidden: admin only.");

    const { checkAdminCode, issueAdminToken } = await import("./admin-code.server");
    if (!checkAdminCode(data.code.trim())) throw new Error("Incorrect admin code.");
    return { token: await issueAdminToken(context.userId) };
  });
