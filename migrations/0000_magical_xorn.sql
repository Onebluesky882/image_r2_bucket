CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text,
	`website` text,
	`added` text DEFAULT CURRENT_TIMESTAMP
);
