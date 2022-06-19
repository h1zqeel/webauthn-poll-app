/*
  Warnings:

  - You are about to drop the column `credentialPublicKey` on the `UserCredentials` table. All the data in the column will be lost.
  - Added the required column `key` to the `UserCredentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserCredentials` DROP COLUMN `credentialPublicKey`,
    ADD COLUMN `key` VARCHAR(191) NOT NULL;
