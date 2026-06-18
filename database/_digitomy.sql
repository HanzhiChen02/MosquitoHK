# Dump of table digitomy
# ------------------------------------------------------------

CREATE TABLE `digitomy` (
  `id` varchar(36) NOT NULL,
  `capture_id` varchar(255) DEFAULT NULL,
  `camera` int(11) DEFAULT NULL,
  `mosquito_index` int(11) DEFAULT NULL,
  `x1` int(11) DEFAULT NULL,
  `x2` int(11) DEFAULT NULL,
  `y1` int(11) DEFAULT NULL,
  `y2` int(11) DEFAULT NULL,
  `place` varchar(255) DEFAULT NULL,
  `captured_at` timestamp NULL DEFAULT NULL,
  `organization_id` int(11) DEFAULT NULL,
  `mosquito_gcs_url` varchar(255) DEFAULT NULL,
  `stickypad_gcs_url` varchar(255) DEFAULT NULL,
  `genus` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `gonotrophy` varchar(255) DEFAULT NULL,
  `cam_genus` varchar(255) DEFAULT NULL,
  `cam_gonotropy` varchar(255) DEFAULT NULL,
  `cam_gender` varchar(255) DEFAULT NULL,
  `x` double DEFAULT NULL,
  `y` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;