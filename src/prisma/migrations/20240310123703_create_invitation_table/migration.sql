-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "inviteToEmail" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "inviteFromUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
