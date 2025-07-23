/*
  Warnings:

  - You are about to drop the column `rôle` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `rôle`,
    ADD COLUMN `role` ENUM('utilisateur', 'admin') NOT NULL DEFAULT 'utilisateur';
