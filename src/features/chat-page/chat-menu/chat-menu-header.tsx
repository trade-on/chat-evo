import { MenuTrayToggle } from "@/features/main-menu/menu-tray-toggle";
import { CreateChatAndRedirect } from "../chat-services/chat-thread-service";
import { NewChat } from "./new-chat";

export const ChatMenuHeader = () => {
  return (
    <div className="flex p-2 px-3 justify-end">
      <form action={CreateChatAndRedirect} className="flex gap-2">
        <NewChat />
      </form>
    </div>
  );
};
