-- Edited by hand: the prototype's deals have no shop or fetch time, so they are dropped rather
-- than copied, and the favorites that point at them go too. D1 ignores PRAGMA foreign_keys.
DELETE FROM `favorites`;--> statement-breakpoint
DROP TABLE `deals`;--> statement-breakpoint
CREATE TABLE `shops` (
	`code` text PRIMARY KEY NOT NULL,
	`store` text NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT "shops_store" CHECK("shops"."store" in ('Yodobashi', 'Rakuten', 'Amazon'))
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_code` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`blurb` text NOT NULL,
	`image` text NOT NULL,
	`url` text NOT NULL,
	`price` integer NOT NULL,
	`fetched_at` integer NOT NULL,
	`found_at` integer NOT NULL,
	`rating` real NOT NULL,
	`reviews` integer NOT NULL,
	FOREIGN KEY (`shop_code`) REFERENCES `shops`(`code`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "deals_category" CHECK("deals"."category" in ('Shoes', 'Clothing', 'Audio', 'Cameras', 'Computers', 'Watches', 'Appliances', 'Beauty', 'Bags', 'Kitchen', 'Gaming', 'Furniture'))
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`deal_id` text NOT NULL,
	`kind` text NOT NULL,
	`ends_at` integer,
	`point_rate` integer,
	PRIMARY KEY(`deal_id`, `kind`),
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "promotions_kind" CHECK("promotions"."kind" in ('sale', 'points')),
	CONSTRAINT "promotions_sale_ends" CHECK("promotions"."kind" <> 'sale' or "promotions"."ends_at" is not null),
	CONSTRAINT "promotions_points_rate" CHECK("promotions"."kind" <> 'points' or "promotions"."point_rate" > 1)
);
