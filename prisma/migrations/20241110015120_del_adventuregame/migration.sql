/*
  Warnings:

  - You are about to drop the `BattleLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Monster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BattleLog" DROP CONSTRAINT "BattleLog_monsterId_fkey";

-- DropForeignKey
ALTER TABLE "BattleLog" DROP CONSTRAINT "BattleLog_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_playerId_fkey";

-- DropTable
DROP TABLE "BattleLog";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "Monster";

-- DropTable
DROP TABLE "Player";
