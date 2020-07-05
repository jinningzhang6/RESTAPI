DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role`varchar(255) NOT NULL,
  `courseId` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`email`),
  KEY (`courseId`)
) ENGINE=InnoDB;

INSERT INTO `users` VALUES
(1,'Billy Zhang','zhangji@oregonstate.edu','hunter2','admin',NULL),
(2,'Barry Le','haozhe@oregonstate.edu','hunter2','student',1),
(3,'Zijing Huang','huangzij@oregonstate.edu','hunter2','student',3),
(4,'Kyo Kusanagi','kusanagi@oregonstate.edu','hunter2','student',3),
(5,'Iori Yagami','yagami@oregonstate.edu','hunter2','student',4),
(6,'Daimon','daimon@oregonstate.edu','hunter2','instructor',NULL),
(7,'SNK','snk@oregonstate.edu','hunter2','admin',NULL),
(8,'Terry Bogard','board@oregonstate.edu','hunter2','student',3),
(9,'Carlos Junior','junior@oregonstate.edu','hunter2','student',1),
(10,'Benton Coff','coff@oregonstate.edu','hunter2','student',2),
(11,'D Heavy','heavy@oregonstate.edu','hunter2','student',4),
(12,'Rob Hess','hess@oregonstate.edu','hunter2','instructor',NULL),
(13,'Kai Zhan','zhanka@oregonstate.edu','hunter2','student',5),
(14,'Jane Joe','janejj@oregonstate.edu','hunter2','student',5),
(15,'Lillard J','lillard@oregonstate.edu','hunter2','student',6);
UNLOCK TABLES;

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `term` varchar(255) NOT NULL,
  `instructorId` INT  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

INSERT INTO `courses` VALUES
(1,'CS','493','Cloud Application','fall19',6),
(2,'CS','475','Parallel Programming','sp20',6),
(3,'CS','381','Programming Fundamentals','fall19',12),
(4,'CS','463','Senior Capstone','sp20',12),
(5,'CS','321','System Administration','wi20',6),
(6,'CS','492','Mobile Development','wi20',12);
UNLOCK TABLES;


DROP TABLE IF EXISTS `assignments`;

CREATE TABLE `assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `courseId` INT NOT NULL,
  `title` varchar(255) NOT NULL,
  `points` INT NOT NULL,
  `due` Date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

INSERT INTO `assignments` VALUES
(1,3,'lab1',100,'2020-06-06T23:59:59+08:00'),
(2,4,'quiz1',100,'2020-06-10T23:59:59+08:00'),
(3,2,'midterm_1',100,'2020-06-20T23:59:59+08:00'),
(4,1,'assignment1',100,'2020-06-03T23:59:59+08:00');
UNLOCK TABLES;

DROP TABLE IF EXISTS `submissions`;

CREATE TABLE `submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assignmentid` INT NOT NULL ,
  `studentid` INT NOT NULL,
  `timestamp` Date NOT NULL,
  `file` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;


INSERT INTO `submissions` VALUES
(1,1,1,'2020-06-06T23:59:59+08:00','test-file'),
(2,2,2,'2020-06-10T23:59:59+08:00','test-file'),
(3,3,3,'2020-06-20T23:59:59+08:00','test-file'),
(4,4,4,'2020-06-03T23:59:59+08:00','test-file');
UNLOCK TABLES;


DROP TABLE IF EXISTS `student_course`;

CREATE TABLE `student_course` (
  `student_courseid` INT NOT NULL AUTO_INCREMENT,
  `studentid` INT NOT NULL ,
  `courseid` INT NOT NULL,
  PRIMARY KEY (`student_courseid`)
) ENGINE=InnoDB;

ALTER TABLE `student_course` ADD UNIQUE `unique_index`(`studentid`, `courseid`);

INSERT INTO `student_course` VALUES
(1,2,1),
(2,2,2),
(3,2,3),
(4,2,4);
UNLOCK TABLES;
