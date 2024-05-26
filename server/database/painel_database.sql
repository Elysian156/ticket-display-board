DROP DATABASE IF EXISTS `painel_database`

CREATE DATABASE IF NOT EXISTS `painel_database`

USE `painel_database`

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
    `id` int AUTO_INCREMENT NOT NULL,
    `name` varchar(255) NOT NULL,
    `cpf` varchar(14) NOT NULL UNIQUE,
    `date_birthday` date NOT NULL,
		`is_especial` BOOLEAN DEFAULT false,
		`deficiency` text,
    PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `passwords`;
CREATE TABLE IF NOT EXISTS `passwords` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`order` int NOT NULL,
	`is_attended` boolean NOT NULL,
	`created_at` DATETIME NOT NULL,
	`date_attended` datetime,
	`user_id` int NOT NULL,
	`is_priority` BOOLEAN,
	`urgency_level` CHAR(1) NOT NULL,
	`unformated_password` VARCHAR(8) NOT NULL,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE IF NOT EXISTS `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL UNIQUE,
	`description` text NOT NULL,
	`levels` int NOT NULL,
	`posted_in` date NOT NULL,
	`user_id` int NOT NULL,
	`password_id` int NOT NULL,
	PRIMARY KEY (`id`)
);


ALTER TABLE `passwords` ADD CONSTRAINT `passwords_fk5` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_fk4` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_fk5` FOREIGN KEY (`password_id`) REFERENCES `passwords`(`id`);