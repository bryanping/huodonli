SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `cSessionInfo`;
CREATE TABLE `cSessionInfo` (
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `session_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_info` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`open_id`),
  KEY `openid` (`open_id`) USING BTREE,
  KEY `skey` (`skey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理用户信息';


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickName` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatarUrl` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` int NOT NULL,
  `province` text COLLATE utf8mb4_unicode_ci,
  `city` text COLLATE utf8mb4_unicode_ci,
  `country` text COLLATE utf8mb4_unicode_ci,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_session_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='';


DROP TABLE IF EXISTS `testTableResponse`;
CREATE TABLE `testTableResponse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `textVal` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='';

INSERT INTO testTableResponse(textVal) values ("some example text");

DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
`id` int NOT NULL AUTO_INCREMENT,
`title` text COLLATE utf8mb4_unicode_ci,
`creator_openid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
`color` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
`date` date NOT NULL,
`start_time` time NOT NULL,
`end_time` time NOT NULL,
`destination` text COLLATE utf8mb4_unicode_ci,
`mapObj` text COLLATE utf8mb4_unicode_ci,
`create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='';

DROP TABLE IF EXISTS `event_invite`;
CREATE TABLE `event_invite` (
`id` int NOT NULL AUTO_INCREMENT,
`event_id` int NOT NULL,
`invited_openid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
`status` boolean DEFAULT NULL,
`create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (event_id) REFERENCES event(id),
PRIMARY KEY (`id`),
KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='';

DROP TABLE IF EXISTS `token`;
CREATE TABLE `token` (
`openid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
`code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
`expire` timestamp NOT NULL,
PRIMARY KEY (`openid`),
KEY `openid` (`openid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='';

SET FOREIGN_KEY_CHECKS = 1;