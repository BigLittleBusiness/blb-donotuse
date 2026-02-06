CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metric_type` varchar(100) NOT NULL,
	`metric_value` decimal(12,2) NOT NULL,
	`period` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grant_id` int NOT NULL,
	`applicant_id` int NOT NULL,
	`status` enum('draft','submitted','under_review','approved','rejected','withdrawn') NOT NULL DEFAULT 'draft',
	`application_text` text NOT NULL,
	`requested_amount` decimal(12,2),
	`supporting_documents` json,
	`submission_date` datetime,
	`review_score` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grant_id` int,
	`application_id` int,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`parent_comment_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`grant_id` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grant_id` int,
	`application_id` int,
	`voter_id` int NOT NULL,
	`vote_type` enum('support','oppose','neutral') NOT NULL,
	`session_id` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`follower_id` int NOT NULL,
	`followee_id` int,
	`grant_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grant_watches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`grant_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grant_watches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`budget` decimal(12,2) NOT NULL,
	`budgetAlias` decimal(12,2),
	`status` enum('draft','open','closed','awarded','completed') NOT NULL DEFAULT 'draft',
	`category` varchar(100) NOT NULL,
	`council_id` int,
	`created_by` int NOT NULL,
	`opening_date` datetime,
	`closing_date` datetime,
	`eligibility_criteria` text,
	`application_requirements` text,
	`max_applications` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`type` enum('application_update','grant_update','comment','vote','follow','system') NOT NULL,
	`related_grant_id` int,
	`related_application_id` int,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` int NOT NULL,
	`reviewer_id` int NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`comments` text,
	`recommendation` enum('approve','reject','needs_revision') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','staff') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(512);