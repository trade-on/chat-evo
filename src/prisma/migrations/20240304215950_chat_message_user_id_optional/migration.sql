/*
  Warnings:

  - You are about to drop the column `name` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "name",
ALTER COLUMN "user_id" DROP NOT NULL;
