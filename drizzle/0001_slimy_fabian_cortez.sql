CREATE TABLE `calculation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`toolId` varchar(64) NOT NULL,
	`inputParams` text NOT NULL,
	`result` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculation_history_id` PRIMARY KEY(`id`)
);
