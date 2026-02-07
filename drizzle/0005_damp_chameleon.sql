CREATE TABLE `grant_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grant_id` int NOT NULL,
	`suburb_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grant_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suburbs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`postcode` varchar(10) NOT NULL,
	`state` varchar(50) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suburbs_id` PRIMARY KEY(`id`),
	CONSTRAINT `suburbs_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`suburb_id` int NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_locations_id` PRIMARY KEY(`id`)
);
