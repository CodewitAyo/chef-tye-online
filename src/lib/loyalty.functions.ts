import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, ledgerRes, redemptionsRes, ordersRes, rewardsRes, roleRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, display_name, phone, points, lifetime_points, highest_points, created_at, status")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("loyalty_points_ledger")
        .select("id, delta, reason, note, created_at, order_id, redemption_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("reward_redemptions")
        .select("id, reward_id, points_cost, status, requested_at, honored_at, note")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .limit(30),
      supabase
        .from("orders")
        .select("id, source, subtotal_ngn, delivery_fee_ngn, total_ngn, occurred_at, status, note")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .limit(30),
      supabase
        .from("rewards_catalog")
        .select("id, code, name, description, points_cost, tier_required, active")
        .eq("active", true)
        .order("points_cost", { ascending: true }),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    ]);

    const isAdmin = roleRes.data === true;
    return {
      profile: profileRes.data,
      ledger: ledgerRes.data ?? [],
      redemptions: redemptionsRes.data ?? [],
      orders: ordersRes.data ?? [],
      rewards: rewardsRes.data ?? [],
      isAdmin,
    };
  });

const redeemInput = z.object({ rewardId: z.string().uuid() });

export const redeemReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => redeemInput.parse(d))
  .handler(async ({ data, context }) => {
    // All checks (reward active, balance, ledger deduction, audit) happen
    // atomically inside the redeem_reward SECURITY DEFINER function.
    const { data: redemptionId, error } = await context.supabase.rpc("redeem_reward", {
      _reward_id: data.rewardId,
    });
    if (error) {
      const msg = error.message || "";
      if (msg.includes("Not enough points")) throw new Error("Not enough points.");
      if (msg.includes("Reward unavailable")) throw new Error("Reward unavailable.");
      console.error("[loyalty] redeem failed", error);
      throw new Error("Could not create redemption.");
    }
    return { ok: true, redemptionId: redemptionId as string };
  });


const addOrderInput = z.object({
  userEmail: z.string().email(),
  source: z.enum(["online", "whatsapp", "instagram", "offline", "manual_past", "other"]),
  subtotalNgn: z.number().int().min(0).max(100_000_000),
  deliveryFeeNgn: z.number().int().min(0).max(10_000_000).default(0),
  occurredAt: z.string().optional(),
  externalRef: z.string().max(120).optional(),
  note: z.string().max(1000).optional(),
});

async function requireAdmin(supabase: unknown, userId: string) {
  const s = supabase as {
    rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await s.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error("Admin check failed.");
  if (data !== true) throw new Error("Forbidden: admin only.");
}

export const adminAddOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => addOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: targetId, error: lookupErr } = await context.supabase.rpc("admin_user_id_by_email", { _email: data.userEmail });
    if (lookupErr) throw new Error("User lookup failed.");
    if (!targetId) throw new Error("No member found with that email.");

    const total = data.subtotalNgn + data.deliveryFeeNgn;
    const { data: order, error: oErr } = await context.supabase
      .from("orders")
      .insert({
        user_id: targetId as string,
        source: data.source,
        external_ref: data.externalRef ?? null,
        subtotal_ngn: data.subtotalNgn,
        delivery_fee_ngn: data.deliveryFeeNgn,
        total_ngn: total,
        occurred_at: data.occurredAt ?? new Date().toISOString(),
        status: "completed",
        note: data.note ?? null,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (oErr || !order) throw new Error("Order insert failed: " + (oErr?.message ?? ""));

    await context.supabase.from("audit_log").insert({
      actor_id: context.userId,
      action: "order.admin_add",
      target_table: "orders",
      target_id: order.id,
      after: { user_id: targetId, ...data },
      note: data.note,
    });
    return { ok: true, orderId: order.id };
  });

const adjustInput = z.object({
  userEmail: z.string().email(),
  delta: z.number().int().min(-100_000).max(100_000),
  reason: z.string().min(2).max(500),
});

export const adminAdjustPoints = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adjustInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    if (data.delta === 0) throw new Error("Delta cannot be zero.");
    const { data: targetId, error: lookupErr } = await context.supabase.rpc("admin_user_id_by_email", { _email: data.userEmail });
    if (lookupErr) throw new Error("User lookup failed.");
    if (!targetId) throw new Error("No member found with that email.");

    const { error } = await context.supabase.from("loyalty_points_ledger").insert({
      user_id: targetId as string,
      delta: data.delta,
      reason: "adjust",
      note: data.reason,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_log").insert({
      actor_id: context.userId,
      action: "points.adjust",
      target_table: "profiles",
      target_id: targetId as string,
      after: { delta: data.delta, reason: data.reason },
      note: data.reason,
    });
    return { ok: true };
  });

const honorInput = z.object({ redemptionId: z.string().uuid(), note: z.string().max(500).optional() });

export const adminHonorRedemption = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => honorInput.parse(d))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("reward_redemptions")
      .update({
        status: "honored",
        honored_at: new Date().toISOString(),
        honored_by: context.userId,
        note: data.note ?? null,
      })
      .eq("id", data.redemptionId);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_log").insert({
      actor_id: context.userId,
      action: "redemption.honor",
      target_table: "reward_redemptions",
      target_id: data.redemptionId,
      note: data.note,
    });
    return { ok: true };
  });


export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const db = context.supabase;

    const [members, pending, recentOrders, recentAudit] = await Promise.all([
      db
        .from("profiles")
        .select("id, full_name, display_name, points, lifetime_points, highest_points, created_at")
        .order("lifetime_points", { ascending: false })
        .limit(100),
      db
        .from("reward_redemptions")
        .select("id, user_id, reward_id, points_cost, status, requested_at, note")
        .eq("status", "available")
        .order("requested_at", { ascending: false })
        .limit(50),
      db
        .from("orders")
        .select("id, user_id, source, subtotal_ngn, total_ngn, occurred_at, status, note")
        .order("occurred_at", { ascending: false })
        .limit(30),
      db
        .from("audit_log")
        .select("id, actor_id, action, target_table, target_id, note, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const overviewError = [members.error, pending.error, recentOrders.error, recentAudit.error].find(Boolean);
    if (overviewError) throw new Error(`Admin overview query failed: ${overviewError.message}`);

    const userIds = Array.from(
      new Set([
        ...(members.data ?? []).map((m) => m.id),
        ...(pending.data ?? []).map((p) => p.user_id),
        ...(recentOrders.data ?? []).map((o) => o.user_id),
      ]),
    );
    let emailById = new Map<string, string>();
    if (userIds.length) {
      const { data: emails } = await db.rpc("admin_emails_for_users", { _user_ids: userIds });
      if (emails) emailById = new Map((emails as Array<{ id: string; email: string }>).map((e) => [e.id, e.email ?? ""]));
    }

    const membersWithEmail = (members.data ?? []).map((m) => ({ ...m, email: emailById.get(m.id) ?? "" }));

    const rewardsCat = await db.from("rewards_catalog").select("id, name");
    if (rewardsCat.error) throw new Error(`Rewards lookup failed: ${rewardsCat.error.message}`);
    const rewardName = new Map((rewardsCat.data ?? []).map((r) => [r.id, r.name]));
    const pendingEnriched = (pending.data ?? []).map((p) => ({
      ...p,
      email: emailById.get(p.user_id) ?? "",
      reward_name: rewardName.get(p.reward_id) ?? "",
    }));
    const ordersEnriched = (recentOrders.data ?? []).map((o) => ({ ...o, email: emailById.get(o.user_id) ?? "" }));

    return {
      members: membersWithEmail,
      pendingRedemptions: pendingEnriched,
      recentOrders: ordersEnriched,
      audit: recentAudit.data ?? [],
    };
  });
