/**
 * Inquiry persistence (Supabase) and notification dispatch.
 *
 * Order of operations for one submission:
 *   1. saveInquiry: insert, or return the stored row when the idempotency key is retried.
 *   2. notifyInquiry: claim the notification (only one concurrent request wins),
 *      send to configured channels that have not succeeded yet, record the outcome.
 * A notification failure never removes or invalidates the saved inquiry.
 */
import { sendAutoReply, sendInboxNotification, type Inquiry, type SendResult } from "@/lib/email";
import { sendDiscord, sendSlack } from "@/lib/notify";
import { CONTACT_LIMITS } from "@/lib/rate-limit";
import { autoReplyEnabled } from "@/lib/server-env";
import { callRpc } from "@/lib/supabase";

export type SaveOutcome = "created" | "duplicate" | "key_conflict" | "rate_limited";
export type SaveResult = { outcome: SaveOutcome; id: string | null };

type SubmitRow = { inquiry_id: string | null; outcome: SaveOutcome; notification_status: string | null };

export async function saveInquiry(inquiry: Inquiry, idempotencyKey: string, ipHash: string | null): Promise<SaveResult> {
  const rows = await callRpc<SubmitRow[]>("submit_inquiry", {
    p_idempotency_key: idempotencyKey,
    p_name: inquiry.name,
    p_email: inquiry.email,
    p_company: inquiry.company,
    p_inquiry_type: inquiry.interest,
    p_message: inquiry.message,
    p_ip_hash: ipHash,
    p_window_minutes: CONTACT_LIMITS.windowMinutes,
    p_max_per_ip: CONTACT_LIMITS.perIp,
    p_max_per_email: CONTACT_LIMITS.perEmail,
  });
  const row = Array.isArray(rows) ? rows[0] : undefined;
  if (!row?.outcome) throw new Error("submit_inquiry returned no row");
  return { outcome: row.outcome, id: row.inquiry_id };
}

/** Team channels decide the overall status; the auto-reply is tracked but never makes it "failed". */
const TEAM_CHANNELS = ["email", "slack", "discord"] as const;
type Channel = (typeof TEAM_CHANNELS)[number] | "auto_reply";
type ChannelState = "sent" | "failed" | "skipped";
export type NotificationOutcome = "sent" | "failed" | "skipped" | "not_claimed";

type ClaimRow = { channels: Partial<Record<Channel, ChannelState>> | null; attempts: number };

/** Human-readable reference used in notifications, e.g. "3F2A9C1B". */
export const shortReference = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

export async function notifyInquiry(inquiry: Inquiry, id: string): Promise<NotificationOutcome> {
  const claimed = await callRpc<ClaimRow[]>("claim_inquiry_notification", { p_inquiry_id: id });
  const claim = Array.isArray(claimed) ? claimed[0] : undefined;
  if (!claim) return "not_claimed"; // another request is sending, or it already finished

  const previous = claim.channels ?? {};
  const reference = shortReference(id);
  const pending = (channel: Channel) => previous[channel] !== "sent";
  const skip = Promise.resolve<SendResult>({ status: "skipped" });

  // Retries only resend channels that have not already delivered, so nobody gets a duplicate.
  const [email, slack, discord] = await Promise.all([
    pending("email") ? sendInboxNotification(inquiry, reference) : null,
    pending("slack") ? sendSlack(inquiry, reference) : null,
    pending("discord") ? sendDiscord(inquiry, reference) : null,
  ].map(task => task ?? skip));

  const attempt: Partial<Record<Channel, ChannelState>> = {};
  const errors: string[] = [];
  const record = (channel: Channel, result: SendResult) => {
    if (previous[channel] === "sent") return; // untouched this attempt
    attempt[channel] = result.status;
    if (result.status === "failed") errors.push(`${channel}:${result.error}`);
  };
  record("email", email);
  record("slack", slack);
  record("discord", discord);

  const merged = { ...previous, ...attempt };
  const team = TEAM_CHANNELS.map(channel => merged[channel]);
  const status: Exclude<NotificationOutcome, "not_claimed"> =
    team.includes("failed") ? "failed" : team.includes("sent") ? "sent" : "skipped";

  // Optional confirmation to the visitor: at most once, and only when the team was reached.
  if (autoReplyEnabled() && status === "sent" && pending("auto_reply")) {
    record("auto_reply", await sendAutoReply(inquiry, reference));
  }

  // Record the outcome (retried once). If it still cannot be written, the claim simply expires
  // after its lease and the row shows "sending" in the dashboard until then.
  const finish = () => callRpc("finish_inquiry_notification", {
    p_inquiry_id: id,
    p_status: status,
    p_channels: attempt,
    p_error: errors.join(",").slice(0, 200) || null,
  });
  await finish().catch(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await finish();
  });
  return status;
}
