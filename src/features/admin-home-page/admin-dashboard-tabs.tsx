import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { AdminDashboardContentRequest } from "./admin-dashboard-content-request";
import { prisma } from "../common/services/sql";
import { AdminDashboardContentBilling } from "./admin-dashboard-content-billing";
import { getCurrentUser } from "../auth-page/helpers";

type AdminDashboardTabsProps = {
  tenantId: string;
};
export const AdminDashboardTabs = async ({
  tenantId,
}: AdminDashboardTabsProps) => {
  const chatMessagesWithUser = await prisma.chatMessage.findMany({
    select: {
      id: true,
      createdAt: true,
      user: true,
    },
    where: {
      tenantId,
      role: "user",
    },
  });
  const threads = await prisma.chatThread.findMany({
    select: { id: true },
    where: { tenantId },
  });
  const users = await prisma.user.findMany({
    select: { id: true },
    where: { tenantId },
  });
  const user = await getCurrentUser();
  return (
    <Tabs defaultValue={"request"} className="w-full">
      <TabsList className="flex flex-1">
        <TabsTrigger value="request" className="flex-1">
          リクエスト数
        </TabsTrigger>
        <TabsTrigger value="pay" className="flex-1">
          従量課金
        </TabsTrigger>
      </TabsList>
      <TabsContent value={"request"}>
        <AdminDashboardContentRequest
          threadNumber={threads.length}
          userNumber={users.length}
          chatMessagesWithUser={chatMessagesWithUser}
        />
      </TabsContent>
      <TabsContent value={"pay"}>
        <AdminDashboardContentBilling
          threadNumber={threads.length}
          userNumber={users.length}
          chatMessagesWithUser={chatMessagesWithUser}
          tenantId={tenantId}
          userId={user.id}
        />
      </TabsContent>
    </Tabs>
  );
};
