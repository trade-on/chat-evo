import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import { getCurrentUser } from "../auth-page/helpers";
import { prisma } from "../common/services/sql";
import { AdminDashboardContentRequest } from "./admin-dashboard-content-request";
import { AdminDashboardTabs } from "./admin-dashboard-tabs";

export const AdminHome = async () => {
  const { tenantId } = await getCurrentUser();
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
  });
  const description = tenant?.name
    ? `${tenant?.name}内でのサービスの活用状況を管理できます`
    : "";
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col gap-6 pb-6">
        <Hero title={"管理画面"} description={description} />
        <div className="max-w-screen-lg mx-auto">
          <AdminDashboardTabs tenantId={tenantId} />
        </div>
      </main>
    </ScrollArea>
  );
};
