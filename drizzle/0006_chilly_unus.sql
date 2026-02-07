CREATE TABLE `location_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`suburb_id` int NOT NULL,
	`notify_new_grants` boolean NOT NULL DEFAULT true,
	`notify_grant_updates` boolean NOT NULL DEFAULT true,
	`notify_nearby_areas` boolean NOT NULL DEFAULT false,
	`nearby_radius_km` int NOT NULL DEFAULT 10,
	`notification_frequency` enum('immediate','daily','weekly','never') NOT NULL DEFAULT 'immediate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `location_notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`suburb_id` int NOT NULL,
	`grant_id` int NOT NULL,
	`notification_type` enum('new_grant','grant_updated','application_deadline_reminder','grant_awarded') NOT NULL,
	`is_sent` boolean NOT NULL DEFAULT false,
	`sent_at` timestamp,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `location_notifications_id` PRIMARY KEY(`id`)
);
