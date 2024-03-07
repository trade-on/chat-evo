import { customAlphabet } from "nanoid";

import { ChatThread } from "@prisma/client";

export const uniqueId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 36);
  return nanoid();
};

export const sortByTimestamp = (a: ChatThread, b: ChatThread) => {
  return (
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
};
