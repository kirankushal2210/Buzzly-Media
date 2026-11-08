import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Every contact form submission is stored here before any email is sent, so an
 * inquiry is never lost if Resend is down or not configured yet.
 */
export const contactInquiries = sqliteTable(
  "contact_inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company").notNull().default(""),
    interest: text("interest").notNull(),
    message: text("message").notNull(),
    /** received → emailed | email_failed | email_skipped */
    status: text("status", { enum: ["received", "emailed", "email_failed", "email_skipped"] }).notNull().default("received"),
    emailId: text("email_id"),
    emailError: text("email_error"),
    /** received → sent | failed | skipped (customer confirmation email) */
    autoReplyStatus: text("auto_reply_status", { enum: ["received", "sent", "failed", "skipped"] }).notNull().default("received"),
    /** Salted SHA-256 of the sender IP, used only for rate limiting. Never the raw IP. */
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    emailedAt: text("emailed_at"),
  },
  table => [
    index("contact_inquiries_created_at_idx").on(table.createdAt),
    index("contact_inquiries_status_idx").on(table.status),
    index("contact_inquiries_ip_hash_idx").on(table.ipHash, table.createdAt),
    index("contact_inquiries_email_idx").on(table.email, table.createdAt),
  ],
);

export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type NewContactInquiry = typeof contactInquiries.$inferInsert;
