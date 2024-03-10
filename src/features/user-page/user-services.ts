"use server";
import { Invitation, User } from "@prisma/client";
import { prisma } from "@/features/common/services/sql";
import { getCurrentUser } from "../auth-page/helpers";
import { sgMail } from "../common/services/sendgrid";

export const FindAllTenantUsers = async (): Promise<User[] | undefined> => {
  try {
    const { tenantId } = await getCurrentUser();
    const users = await prisma.user.findMany({
      where: {
        tenantId,
      },
    });
    return users;
  } catch (error) {
    console.error("Error", error);
  }
};

export const FindInvitationWithTenant = async (invitationId: string) => {
  const invitation = await prisma.invitation.findUnique({
    select: {
      id: true,
      inviteToEmail: true,
      role: true,
      inviteFromUserId: true,
      createdAt: true,
      updatedAt: true,
      tenant: true,
    },
    where: {
      id: invitationId,
    },
  });
  return invitation;
};

export const inviteUsers = async (
  users: { email: string; role: "admin" | "member" }[],
  inviteFromUserId: string
) => {
  const { tenantId } = await getCurrentUser();
  const invitationsData: {
    inviteFromUserId: string;
    inviteToEmail: string;
    role: "admin" | "member";
    tenantId: string;
  }[] = users.map((user) => ({
    tenantId,
    inviteFromUserId,
    inviteToEmail: user.email,
    role: user.role,
  }));
  console.log(
    "inviteUsers",
    invitationsData,
    process.env.AZURE_COSMOSDB_CONTAINER_NAME
  );
  // DBに招待リンクを登録
  await prisma.invitation.createMany({
    data: invitationsData,
    skipDuplicates: true,
  });
  // SendGridでリンクを送信
  const invitationPromise = users.map(async ({ email }) => {
    const invitation = await prisma.invitation.findUnique({
      where: {
        inviteToEmail: email,
      },
    });
    return {
      id: invitation?.id ?? "",
      inviteToEmail: email,
    };
  });
  const invitationObjects = await Promise.all(invitationPromise);
  await sendInvitationMail(invitationObjects);
};

const sendInvitationMail = async (
  sendProps: Pick<Invitation, "id" | "inviteToEmail">[]
) => {
  const personalizations = sendProps.map(({ id, inviteToEmail }) => ({
    to: [{ email: inviteToEmail }],
    dynamic_template_data: {
      invitation_url: `${process.env.NEXT_PUBLIC_ORIGIN}/invitation/${id}`,
    },
  }));
  try {
    const res = await sgMail.send({
      personalizations,
      from: { email: "noreply_bizai@trade-on.jp" },
      // @ts-ignore
      template_id: "d-8abf8fe2361e41368d384ba7470e18e9",
    });
    console.log("Email sent", res);
  } catch (e) {
    console.error(e);
  }
};
