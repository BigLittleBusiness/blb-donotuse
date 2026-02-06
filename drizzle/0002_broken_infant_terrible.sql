CREATE TABLE `saved_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filters` json NOT NULL,
	`is_public` boolean NOT NULL DEFAULT false,
	`is_preset` boolean NOT NULL DEFAULT false,
	`usage_count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_filters_id` PRIMARY KEY(`id`)
);
