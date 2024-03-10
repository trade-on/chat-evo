/*
  Warnings:

  - A unique constraint covering the columns `[inviteToEmail]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invitation_inviteToEmail_key" ON "Invitation"("inviteToEmail");
