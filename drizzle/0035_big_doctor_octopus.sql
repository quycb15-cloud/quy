CREATE TABLE `daily_care_team_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityDate` timestamp NOT NULL,
	`unit` varchar(120) NOT NULL,
	`note` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_care_team_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_care_team_notes_unique_unit_date` UNIQUE(`unit`,`activityDate`)
);
--> statement-breakpoint
CREATE INDEX `daily_care_team_notes_unit_date_index` ON `daily_care_team_notes` (`unit`,`activityDate`);