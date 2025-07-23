/*
  Warnings:

  - You are about to drop the column `acomptePayé` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `heure` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `dateCréation` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `quantite` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `adresseLivraison` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `adresseLivraison` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `prixUnitaire` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantite` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `prix` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `durée` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `prix` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `adresseLivraison` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `motDePasse` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.
  - Added the required column `hour` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Appointment` DROP COLUMN `acomptePayé`,
    DROP COLUMN `heure`,
    DROP COLUMN `statut`,
    ADD COLUMN `depositPaid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hour` DATETIME(3) NOT NULL,
    ADD COLUMN `status` ENUM('pending', 'confirmed', 'canceled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `Cart` DROP COLUMN `dateCréation`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `quantite`,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Guest` DROP COLUMN `adresseLivraison`,
    DROP COLUMN `nom`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `adresseLivraison`,
    DROP COLUMN `date`,
    DROP COLUMN `statut`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deliveryAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('pending', 'paid', 'canceled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `OrderItem` DROP COLUMN `prixUnitaire`,
    DROP COLUMN `quantite`,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `unitPrice` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `nom`,
    DROP COLUMN `prix`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `durée`,
    DROP COLUMN `nom`,
    DROP COLUMN `prix`,
    ADD COLUMN `duration` INTEGER NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `adresseLivraison`,
    DROP COLUMN `motDePasse`,
    DROP COLUMN `nom`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user';
