import { InviteUserDialog } from "@/features/user-page/invite-user-dialog";
import { UserListTable } from "@/features/user-page/user-list";
import { FindAllTenantUsers } from "@/features/user-page/user-services";

export default async function MemberPage() {
  const users = await FindAllTenantUsers();
  const inviteUser = () => {};
  return (
    <div>
      <InviteUserDialog />
      <UserListTable users={users ?? []} />
    </div>
  );
}
