/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `ChatThread` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatThread" DROP COLUMN "tenant_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tenant_id";
