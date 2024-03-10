import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { AdminDashboardContentRequest } from "./admin-dashboard-content-request";
import { prisma } from "../common/services/sql";

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
      // TODO: tenantIdで絞り込めるようにする
      // tenantId,
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
      <TabsContent value={"pay"}></TabsContent>
    </Tabs>
  );
};
