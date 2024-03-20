import { InviteUserDialog } from "@/features/user-page/invite-user-dialog";
import { UserListTable } from "@/features/user-page/user-list";
import { FindAllTenantUsers } from "@/features/user-page/user-services";

export default async function MemberPage() {
  const users = await FindAllTenantUsers();
  return (
    <div className="flex flex-col items-end gap-4 mx-auto pt-40">
      <div>
        <InviteUserDialog />
      </div>
      <UserListTable users={users ?? []} />
    </div>
  );
}
