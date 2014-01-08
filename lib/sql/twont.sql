DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` VARCHAR(10) NOT NULL,
  `body` VARCHAR(255) NOT NULL,
  `tweet_id` INT NOT NULL,
  `date` DATETIME NOT NULL,
  `author_name` VARCHAR(255),
  PRIMARY KEY (`id`),
  UNIQUE KEY(`uid`)
);

DROP TABLE IF EXISTS `tweets`;

CREATE TABLE `tweets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(255) NOT NULL,
  `user_screen_name` VARCHAR(128) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `nb_comments` INT NOT NULL,
  PRIMARY KEY (`id`)
);

ALTER TABLE `comments` ADD FOREIGN KEY (tweet_id) REFERENCES `tweets` (`id`) ON DELETE CASCADE;

ALTER TABLE `tweets` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `comments` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;