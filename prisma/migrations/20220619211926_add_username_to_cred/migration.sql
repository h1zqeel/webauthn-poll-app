/*
  Warnings:

  - Added the required column `username` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserCredentials` ADD COLUMN `username` VARCHAR(191) NOT NULL;
