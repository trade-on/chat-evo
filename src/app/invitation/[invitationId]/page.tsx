import { FindInvitationWithTenant } from "@/features/user-page/user-services";
import { InvitationForm } from "../invitation-form";

const Invitation = async ({
  params,
}: {
  params: Record<"invitationId", string>;
}) => {
  const invitationId = params.invitationId;
  console.log("params", params, params.invitationId);
  if (!invitationId) {
    throw new Error("invitationId is required");
  }
  const invitationWithTenant = await FindInvitationWithTenant(invitationId);
  if (!invitationWithTenant) {
    throw new Error("invitation Not Found");
  }
  console.log("invitationWithTenant", invitationWithTenant);
  return (
    <div>
      <h1>{invitationWithTenant.tenant.name}の招待ページ</h1>
      <InvitationForm
        tenantId={invitationWithTenant.tenant.id}
        invitedEmail={invitationWithTenant.inviteToEmail}
      />
    </div>
  );
};

export default Invitation;
