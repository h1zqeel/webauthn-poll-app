-- CreateTable
CREATE TABLE `UserCredentials` (
    `credentialID` VARCHAR(191) NOT NULL,
    `credentialPublicKey` VARCHAR(191) NOT NULL,
    `counter` INTEGER NOT NULL,

    UNIQUE INDEX `UserCredentials_credentialID_key`(`credentialID`),
    PRIMARY KEY (`credentialID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
