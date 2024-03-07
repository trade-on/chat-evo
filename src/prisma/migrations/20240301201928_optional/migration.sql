/*
  Warnings:

  - You are about to drop the column `userId` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "userId",
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
