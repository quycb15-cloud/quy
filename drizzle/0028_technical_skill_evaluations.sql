CREATE TABLE `technical_skill_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workerId` int NOT NULL,
	`evaluationDate` timestamp NOT NULL,
	`periodLabel` varchar(80) NOT NULL,
	`technicalScore` decimal(5,2) NOT NULL,
	`productivityScore` decimal(5,2) NOT NULL,
	`qualityScore` decimal(5,2) NOT NULL,
	`safetyScore` decimal(5,2) NOT NULL,
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technical_skill_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `technical_skill_evaluations_worker_period_index` ON `technical_skill_evaluations` (`workerId`,`periodLabel`);
--> statement-breakpoint
CREATE INDEX `technical_skill_evaluations_date_index` ON `technical_skill_evaluations` (`evaluationDate`);
