ALTER TABLE `latex_production_plans` ADD `planThreadLatex` decimal(14,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `latex_production_plans` ADD `planDryFromFrozen` decimal(14,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `latex_production_plans` ADD `planDryFromThread` decimal(14,2) DEFAULT '0.00' NOT NULL;