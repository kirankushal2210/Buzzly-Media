ALTER TABLE `contact_inquiries` ADD `auto_reply_status` text DEFAULT 'received' NOT NULL;--> statement-breakpoint
ALTER TABLE `contact_inquiries` ADD `ip_hash` text;--> statement-breakpoint
CREATE INDEX `contact_inquiries_ip_hash_idx` ON `contact_inquiries` (`ip_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_email_idx` ON `contact_inquiries` (`email`,`created_at`);