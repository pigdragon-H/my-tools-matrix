ALTER TABLE `calculation_history` ADD `user_id` int;--> statement-breakpoint
ALTER TABLE `calculation_history` ADD `tool_id` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `calculation_history` ADD `input_params` text NOT NULL;--> statement-breakpoint
ALTER TABLE `calculation_history` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_premium` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_customer_id` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `last_signed_in` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `calculation_history` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `calculation_history` DROP COLUMN `toolId`;--> statement-breakpoint
ALTER TABLE `calculation_history` DROP COLUMN `inputParams`;--> statement-breakpoint
ALTER TABLE `calculation_history` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;