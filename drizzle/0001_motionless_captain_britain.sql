CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`store` text NOT NULL,
	`channel` text NOT NULL,
	`prefecture` text,
	`city` text,
	`original_price` integer NOT NULL,
	`sale_price` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`found_at` integer NOT NULL,
	`rating` real NOT NULL,
	`reviews` integer NOT NULL,
	`image` text NOT NULL,
	`url` text NOT NULL,
	`blurb` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `deals_ends_at_idx` ON `deals` (`ends_at`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`deal_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `deal_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
