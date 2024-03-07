import { InvitationForm } from "./invitation-form";
import { getTenant } from "@/features/tenant/tenant-services";

const Invitation = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const tenantId = searchParams.tenantId;
  if (!tenantId || typeof tenantId !== "string") {
    throw new Error("tenantId is required");
  }
  const tenant = await getTenant(tenantId);
  return (
    <div>
      <h1>{tenant?.name}</h1>
      <InvitationForm tenantId={tenantId} />
    </div>
  );
};

export default Invitation;
