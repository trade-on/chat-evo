import { ChatMenu } from "@/features/chat-page/chat-menu/chat-menu";
import { ChatMenuHeader } from "@/features/chat-page/chat-menu/chat-menu-header";
import { FindAllChatThreadForCurrentUser } from "@/features/chat-page/chat-services/chat-thread-service";
import { MenuTray } from "@/features/main-menu/menu-tray";
import { cn } from "@/ui/lib";

import { AI_NAME } from "@/features/theme/theme-config";
import { DisplayError } from "@/features/ui/error/display-error";
import { ScrollArea } from "@/features/ui/scroll-area";
import { FindAllTenantUsers } from "@/features/user-page/user-services";
import { AdminMenuItem } from "@/features/admin-home-page/admin-menu-item";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-1 items-stretch")}>
      <div className="flex-1 flex">
        <MenuTray>
          <ScrollArea>
            <AdminMenuItem href="/admin">ダッシュボード</AdminMenuItem>
            <AdminMenuItem href="/admin/member">ユーザー管理</AdminMenuItem>
            <AdminMenuItem href="/admin/reporting">
              チャットレポート
            </AdminMenuItem>
          </ScrollArea>
        </MenuTray>
        {children}
      </div>
    </div>
  );
}
