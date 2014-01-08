-- ---
-- Make sure old tables are all removed
--
-- ---

DROP TABLE IF EXISTS `thread_has_inboxes`;
DROP TABLE IF EXISTS `threads`;

-- ---
-- Table 'teammate_has_inboxes'
--
-- ---

DROP TABLE IF EXISTS `teammate_has_inboxes`;

CREATE TABLE `teammate_has_inboxes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teammate_id` INT NOT NULL,
  `inbox_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`teammate_id`, `inbox_id`)
);

-- ---
-- Table 'conversation_has_followers'
--
-- ---

DROP TABLE IF EXISTS `conversation_has_followers`;

CREATE TABLE `conversation_has_followers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `teammate_id` INT NOT NULL,
  `last_message_date` DATETIME NOT NULL,
  `archived` TINYINT(1) NOT NULL,
  `trashed` TINYINT(1) NOT NULL,
  `has_assignee` TINYINT(1) NOT NULL,
  `assignee_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`conversation_id`, `teammate_id`),
  KEY (`teammate_id`, `last_message_date`)
);

-- ---
-- Table 'conversation_has_inboxes'
--
-- ---

DROP TABLE IF EXISTS `conversation_has_inboxes`;

CREATE TABLE `conversation_has_inboxes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `inbox_id` INT NOT NULL,
  `last_message_date` DATETIME NOT NULL,
  `archived` TINYINT(1) NOT NULL,
  `trashed` TINYINT(1) NOT NULL,
  `has_assignee` TINYINT(1) NOT NULL,
  `assignee_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`conversation_id`, `inbox_id`),
  KEY (`inbox_id`, `last_message_date`),
  KEY (`conversation_id`)
);

-- ---
-- Table 'conversation_has_tags'
--
-- ---

DROP TABLE IF EXISTS `conversation_has_tags`;

CREATE TABLE `conversation_has_tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `inbox_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  `last_message_date` DATETIME NOT NULL,
  `archived` TINYINT(1) NOT NULL,
  `trashed` TINYINT(1) NOT NULL,
  `has_assignee` TINYINT(1) NOT NULL,
  `assignee_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`conversation_id`, `inbox_id`, `tag_id`),
  KEY (`inbox_id`, `tag_id`, `last_message_date`),
  KEY (`conversation_id`)
);

-- ---
-- Table 'contact_has_social_profiles'
--
-- ---

DROP TABLE IF EXISTS `contact_has_social_profiles`;

CREATE TABLE `contact_has_social_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `contact_id` INT NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `url` VARCHAR(255) NULL,
  `username` VARCHAR(128) NULL,
  PRIMARY KEY (`id`),
  KEY (`contact_id`),
  UNIQUE KEY (`contact_id`, `url`)
);

-- ---
-- Table 'message_has_contributor'
--
-- ---

DROP TABLE IF EXISTS `message_has_recipients`;

CREATE TABLE `message_has_recipients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `message_id` INT NOT NULL,
  `role` ENUM('from', 'to', 'cc', 'bcc', 'reply-to') NOT NULL,
  `type` ENUM('contact', 'inbox', 'teammate') NOT NULL,
  `contact_id` INT NULL,
  `inbox_id` INT NULL,
  `teammate_id` INT NULL,
  `hash` VARCHAR(24),
  PRIMARY KEY (`id`),
  KEY (`message_id`),
  UNIQUE KEY (`hash`)
);

-- ---
-- Table 'notification_has_recipients'
--
-- ---

DROP TABLE IF EXISTS `notification_has_recipients`;

CREATE TABLE `notification_has_recipients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `notification_id` INT NOT NULL,
  `recipient_id` INT NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY (`notification_id`)
);

-- ---
-- Table 'notification_has_inboxes'
--
-- ---

DROP TABLE IF EXISTS `notification_has_inboxes`;

CREATE TABLE `notification_has_inboxes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `notification_id` INT NOT NULL,
  `inbox_id` INT NOT NULL,
  `date` DATETIME NOT NULL,
  `is_activity` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY (`notification_id`),
  KEY (`inbox_id` ,`is_activity`)
);

-- ---
-- Table 'inbox_has_tags'
--
-- ---

DROP TABLE IF EXISTS `inbox_has_tags`;

CREATE TABLE `inbox_has_tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `inbox_id` INT NOT NULL,
  `tag_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`inbox_id`, `tag_id`)
);

-- ---
-- Table 'tags'
--
-- ---

DROP TABLE IF EXISTS `tags`;

CREATE TABLE `tags` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `alias` VARCHAR(64) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `alias`)
);

-- ---
-- Table 'canned_answers'
--
-- ---

DROP TABLE IF EXISTS `canned_answers`;

CREATE TABLE `canned_answers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `body` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `name`)
);

-- ---
-- Table 'notifications'
--
-- ---

DROP TABLE IF EXISTS `notifications`;

CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date` DATETIME NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `teammate_id` INT NULL,
  `comment_id` INT NULL,
  `message_id` INT NULL,
  `conversation_id` INT NULL,
  `inbox_id` INT NULL,
  `contact_id` INT NULL,
  `is_activity` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'comments'
--
-- ---

DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uid` VARCHAR(32) NOT NULL,
  `author_id` INT NOT NULL,
  `body` VARCHAR(255) NOT NULL,
  `date` DATETIME NOT NULL,
  `message_id` INT NOT NULL,
  `company_id` INT NOT NULL,
  `conversation_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`uid`),
  KEY (`message_id`)
);

-- ---
-- Table 'messages'
--
-- ---

DROP TABLE IF EXISTS `messages`;

CREATE TABLE `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `ext_id` VARCHAR(128) NOT NULL,
  `path` VARCHAR(128) NOT NULL,
  `type` ENUM('email') NOT NULL,
  `source` ENUM('front', 'imap', 'smtp') NOT NULL,
  `status` ENUM('sending', 'sent', 'imported', 'error', 'draft') NOT NULL,
  `date` DATETIME NOT NULL,
  `inbound` TINYINT(1) NOT NULL,
  `conversation_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `ext_id`),
  UNIQUE KEY (`path`)
);

-- ---
-- Table 'conversations'
--
-- ---

DROP TABLE IF EXISTS `conversations`;

CREATE TABLE `conversations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `thread_ext_id` VARCHAR(128) NOT NULL,
  `contact_id` INT NOT NULL,
  `archived_until` DATETIME NULL,
  `archived` TINYINT(1) NOT NULL,
  `trashed` TINYINT(1) NOT NULL,
  `replied` TINYINT(1) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `summary` VARCHAR(255) NOT NULL,
  `last_message_date` DATETIME NOT NULL,
  `assignee_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `thread_ext_id`),
  INDEX (`assignee_id`, `trashed`)
);

-- ---
-- Table 'inboxes'
--
-- ---

DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `channel_has_inboxes`;
DROP TABLE IF EXISTS `channels`;
DROP TABLE IF EXISTS `inboxes`;

CREATE TABLE `inboxes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(32) NOT NULL,
  `company_id` INT NOT NULL,
  `private_teammate_id` INT NULL,
  `alias` VARCHAR(64) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `send_as` VARCHAR(255) NULL,
  `num_new` INT NOT NULL,
  `last_message_date` DATETIME NULL,
  `config` MEDIUMTEXT NULL,
  `sync_status` VARCHAR(32) NULL,
  `import_from` INT NOT NULL default 0,
  `import_to` INT NOT NULL default 0,
  `sync_from` INT NOT NULL default 0,
  `account_status` ENUM('ok', 'denied', 'offline') NOT NULL default 'ok',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `alias`),
  UNIQUE KEY (`company_id`, `address`)
);

-- ---
-- Table 'contacts'
--
-- ---

CREATE TABLE `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `avatar` DATETIME NULL,
  `bio` VARCHAR(255) NULL,
  `fullcontact_sync` DATETIME NULL,
  `inbox_id` INT NULL,
  `type` ENUM('contact', 'inbox') NOT NULL default 'contact',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `email`),
  UNIQUE KEY (`company_id`, `inbox_id`)
);

-- ---
-- Table 'teammates'
--
-- ---

DROP TABLE IF EXISTS `teammates`;

CREATE TABLE `teammates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(64) NOT NULL,
  `password_salt` VARCHAR(16) NOT NULL,
  `password_reset_request` DATETIME NULL,
  `given_name` VARCHAR(128) NOT NULL,
  `family_name` VARCHAR(128) NOT NULL,
  `alias` VARCHAR(64) NULL,
  `unread_notifications` INT NOT NULL,
  `notifications_read_until` DATETIME NULL,
  `account_status` ENUM('active', 'pending', 'blocked') NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `admin` TINYINT(1) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `job` VARCHAR(128) NULL,
  `country` VARCHAR(2) NULL,
  `signature` MEDIUMTEXT NULL,
  `avatar` DATETIME NULL,
  `num_followed` INT NOT NULL,
  `num_assigned` INT NOT NULL,
  `notif_settings` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`company_id`, `alias`),
  UNIQUE KEY (`email`)
);

-- ---
-- Table 'companies'
--
-- ---

DROP TABLE IF EXISTS `companies`;

CREATE TABLE `companies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`slug`)
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE `canned_answers` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `teammates` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `inboxes` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `inboxes` ADD FOREIGN KEY (private_teammate_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `contacts` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `contacts` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `contact_has_social_profiles` ADD FOREIGN KEY (contact_id) REFERENCES `contacts` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (message_id) REFERENCES `messages` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (teammate_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (comment_id) REFERENCES `comments` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `notifications` ADD FOREIGN KEY (contact_id) REFERENCES `contacts` (`id`) ON DELETE CASCADE;
ALTER TABLE `notification_has_recipients` ADD FOREIGN KEY (notification_id) REFERENCES `notifications` (`id`) ON DELETE CASCADE;
ALTER TABLE `notification_has_recipients` ADD FOREIGN KEY (recipient_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `notification_has_inboxes` ADD FOREIGN KEY (notification_id) REFERENCES `notifications` (`id`) ON DELETE CASCADE;
ALTER TABLE `notification_has_inboxes` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversations` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversations` ADD FOREIGN KEY (contact_id) REFERENCES `contacts` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversations` ADD FOREIGN KEY (assignee_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `teammate_has_inboxes` ADD FOREIGN KEY (teammate_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `teammate_has_inboxes` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_followers` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_followers` ADD FOREIGN KEY (teammate_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_followers` ADD FOREIGN KEY (assignee_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_inboxes` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_inboxes` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_inboxes` ADD FOREIGN KEY (assignee_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_tags` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_tags` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_tags` ADD FOREIGN KEY (tag_id) REFERENCES `tags` (`id`) ON DELETE CASCADE;
ALTER TABLE `conversation_has_tags` ADD FOREIGN KEY (assignee_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `comments` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `comments` ADD FOREIGN KEY (author_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `comments` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `comments` ADD FOREIGN KEY (message_id) REFERENCES `messages` (`id`) ON DELETE CASCADE;
ALTER TABLE `messages` ADD FOREIGN KEY (company_id) REFERENCES `companies` (`id`) ON DELETE CASCADE;
ALTER TABLE `messages` ADD FOREIGN KEY (conversation_id) REFERENCES `conversations` (`id`) ON DELETE CASCADE;
ALTER TABLE `message_has_recipients` ADD FOREIGN KEY (message_id) REFERENCES `messages` (`id`) ON DELETE CASCADE;
ALTER TABLE `message_has_recipients` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `message_has_recipients` ADD FOREIGN KEY (contact_id) REFERENCES `contacts` (`id`) ON DELETE CASCADE;
ALTER TABLE `message_has_recipients` ADD FOREIGN KEY (teammate_id) REFERENCES `teammates` (`id`) ON DELETE CASCADE;
ALTER TABLE `inbox_has_tags` ADD FOREIGN KEY (inbox_id) REFERENCES `inboxes` (`id`) ON DELETE CASCADE;
ALTER TABLE `inbox_has_tags` ADD FOREIGN KEY (tag_id) REFERENCES `tags` (`id`) ON DELETE CASCADE;

-- ---
-- Table Properties
-- ---

ALTER TABLE `companies` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `teammates` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `inboxes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `canned_answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `tags` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `contacts` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `contact_has_social_profiles` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `notifications` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `conversations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `teammate_has_inboxes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `conversation_has_followers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `conversation_has_inboxes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `conversation_has_tags` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `comments` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `messages` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `message_has_recipients` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `notification_has_recipients` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `notification_has_inboxes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
ALTER TABLE `inbox_has_tags` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Create default company and team
-- ----

SET names utf8;
SET charset utf8;
INSERT INTO `companies` (`name`, `slug`, `created_at`) VALUES ('Front', 'front', now());
INSERT INTO `teammates` (`company_id`, `email`, `given_name`, `family_name`, `alias`, `unread_notifications`, `num_followed`, `num_assigned`, `account_status`, `action`, `admin`, `notif_settings`, `created_at`) VALUES
  (1, 'laurent@frontapp.com', 'Laurent', 'Perrin', 'laurent', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'didier@frontapp.com', 'Didier', 'Forest', 'didier', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'stephane@frontapp.com', 'Stéphane', 'Martin', 'stephane', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'thibaud@frontapp.com', 'Thibaud', 'Elzière', 'thibaud', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'mat@frontapp.com', 'Matthieu', 'Vaxelaire', 'matthieu', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'mathilde@e-founders.com', 'Mathilde', 'Collin', 'mathilde', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'clement@e-founders.com', 'Clément', 'Vouillon', 'clement', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'remi@frontapp.com', 'Rémi', 'Destigny', 'remi', 0, 0, 0, 'active', '', 1, '', now()),
  (1, 'frontdemo@gmail.com', 'Demo', 'Front', 'demo', 0, 0, 0, 'active', '', 1, '', now());
