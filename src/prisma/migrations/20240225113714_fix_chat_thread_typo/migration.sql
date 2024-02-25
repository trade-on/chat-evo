/*
  Warnings:

  - You are about to drop the column `lastMessagedAt` on the `ChatThread` table. All the data in the column will be lost.
  - Added the required column `lastMessageAt` to the `ChatThread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `ChatThread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatThread" DROP COLUMN "lastMessagedAt",
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;
