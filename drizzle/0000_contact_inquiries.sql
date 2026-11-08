CREATE TABLE `contact_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`interest` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`email_id` text,
	`email_error` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`emailed_at` text
);
--> statement-breakpoint
CREATE INDEX `contact_inquiries_created_at_idx` ON `contact_inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `contact_inquiries_status_idx` ON `contact_inquiries` (`status`);