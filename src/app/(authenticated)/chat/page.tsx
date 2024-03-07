import { ChatHome } from "@/features/chat-home-page/chat-home";
import { FindAllExtensionForCurrentUser } from "@/features/extensions-page/extension-services/extension-service";
import { DisplayError } from "@/features/ui/error/display-error";

export default async function Home() {
  return <ChatHome />;
}
