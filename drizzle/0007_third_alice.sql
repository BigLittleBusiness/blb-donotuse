CREATE TABLE `lga_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lga_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('primary_admin','secondary_admin','viewer') NOT NULL DEFAULT 'secondary_admin',
	`email_reports` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lga_admins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_id` int NOT NULL,
	`lga_id` int NOT NULL,
	`report_period` varchar(7) NOT NULL,
	`report_year` int NOT NULL,
	`report_month` int NOT NULL,
	`report_data` json NOT NULL,
	`report_file_url` varchar(512),
	`generation_status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`generation_error` text,
	`generated_at` timestamp,
	`delivery_status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`delivery_error` text,
	`delivered_at` timestamp,
	`delivered_to` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lga_id` int NOT NULL,
	`report_type` enum('monthly','quarterly','annual') NOT NULL DEFAULT 'monthly',
	`schedule_day` int NOT NULL DEFAULT 1,
	`schedule_time` varchar(5) NOT NULL DEFAULT '02:00',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_generated_at` timestamp,
	`next_scheduled_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_schedules_id` PRIMARY KEY(`id`)
);
