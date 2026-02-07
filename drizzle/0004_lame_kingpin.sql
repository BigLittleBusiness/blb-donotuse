CREATE TABLE `email_delivery_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int,
	`recipient_email` varchar(320) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message_id` varchar(255),
	`provider` varchar(50) NOT NULL,
	`status` enum('pending','sent','failed','bounced','opened','clicked') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`delivery_time_ms` int,
	`attempts` int NOT NULL DEFAULT 1,
	`last_attempt_at` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_delivery_logs_id` PRIMARY KEY(`id`)
);
