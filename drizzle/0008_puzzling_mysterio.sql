CREATE TABLE `grant_votes_unique` (
	`grant_id` int NOT NULL,
	`user_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grant_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grant_id` int NOT NULL,
	`user_id` int NOT NULL,
	`vote_type` enum('support','oppose','neutral') NOT NULL,
	`lga_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grant_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vote_visibility_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lga_id` int NOT NULL,
	`visibility_level` enum('public','community_only','admin_only') NOT NULL DEFAULT 'community_only',
	`allow_community_see_own_vote` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vote_visibility_settings_id` PRIMARY KEY(`id`)
);
