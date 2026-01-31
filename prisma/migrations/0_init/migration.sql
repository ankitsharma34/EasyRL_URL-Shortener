-- CreateTable
CREATE TABLE `short_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `short_code` VARCHAR(20) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `short_code`(`short_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

