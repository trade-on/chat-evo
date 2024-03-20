"use client";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "../ui/table";
import { ChatThread } from "@prisma/client";

interface ChatThreadRowProps extends ChatThread {}

const ChatThreadRow: React.FC<ChatThreadRowProps> = (props) => {
  const chatThread = props;

  const router = useRouter();

  return (
    <TableRow
      key={chatThread.id}
      className="cursor-pointer"
      onClick={() => {
        router.push("/admin/reporting/chat/" + chatThread.id);
      }}
    >
      <TableCell className="font-medium">{chatThread.title}</TableCell>
      <TableCell>{chatThread.userName}</TableCell>
      <TableCell>
        {new Date(chatThread.createdAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
};

export default ChatThreadRow;
