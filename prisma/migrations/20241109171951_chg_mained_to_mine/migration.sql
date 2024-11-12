/*
  Warnings:

  - You are about to drop the column `lastMainedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastMainedAt",
ADD COLUMN     "lastMinedAt" TIMESTAMP(3);
