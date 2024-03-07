import { ChatPage } from "@/features/chat-page/chat-page";
import { FindAllChatMessagesForCurrentUser } from "@/features/chat-page/chat-services/chat-message-service";
import { FindChatThreadForCurrentUser } from "@/features/chat-page/chat-services/chat-thread-service";
import { AI_NAME } from "@/features/theme/theme-config";
import { DisplayError } from "@/features/ui/error/display-error";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

interface HomeParams {
  params: {
    id: string;
  };
}

export default async function Home(props: HomeParams) {
  const { id } = props.params;

  const [chatResponse, chatThreadResponse] = await Promise.all([
    FindAllChatMessagesForCurrentUser(id),
    FindChatThreadForCurrentUser(id),
  ]);

  if (chatResponse.status !== "OK") {
    return <DisplayError errors={chatResponse.errors} />;
  }

  if (chatThreadResponse.status !== "OK") {
    return <DisplayError errors={chatThreadResponse.errors} />;
  }

  return (
    <ChatPage
      messages={chatResponse.response}
      chatThread={chatThreadResponse.response}
    />
  );
}
