CREATE TABLE `latex_production_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit` varchar(120) NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL DEFAULT 0,
	`areaHa` decimal(12,2) NOT NULL DEFAULT '0.00',
	`planFrozenLatex` decimal(14,2) NOT NULL DEFAULT '0.00',
	`planDryRubber` decimal(14,2) NOT NULL DEFAULT '0.00',
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `latex_production_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `latex_production_plans_unit_year_month_unique` UNIQUE(`unit`,`year`,`month`)
);
--> statement-breakpoint
CREATE TABLE `technical_skill_monthly_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit` varchar(120) NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`workerCount` int NOT NULL DEFAULT 0,
	`exceptionalCount` int NOT NULL DEFAULT 0,
	`goodCount` int NOT NULL DEFAULT 0,
	`fairCount` int NOT NULL DEFAULT 0,
	`averageCount` int NOT NULL DEFAULT 0,
	`weakCount` int NOT NULL DEFAULT 0,
	`haoDamWorkers` int NOT NULL DEFAULT 0,
	`note` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technical_skill_monthly_summaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `technical_skill_monthly_summaries_unit_month_unique` UNIQUE(`unit`,`monthKey`)
);
--> statement-breakpoint
CREATE INDEX `latex_production_plans_year_month_index` ON `latex_production_plans` (`year`,`month`);--> statement-breakpoint
CREATE INDEX `technical_skill_monthly_summaries_month_index` ON `technical_skill_monthly_summaries` (`monthKey`);