import { sortByTimestamp } from "@/features/common/util";
import { FC } from "react";
import { MenuItemsGroup, MenuItemsGroupName } from "../chat-services/models";
import { ChatGroup } from "./chat-group";
import { ChatMenuItem } from "./chat-menu-item";
import { ChatThread } from "@prisma/client";

interface ChatMenuProps {
  menuItems: Array<ChatThread>;
}

export const ChatMenu: FC<ChatMenuProps> = (props) => {
  const menuItemsGrouped = GroupChatThreadByType(props.menuItems);
  return (
    <div className="pr-3 flex flex-col gap-8 overflow-hidden max-w-[240px]">
      {Object.entries(menuItemsGrouped).map(
        ([groupName, groupItems], index) => (
          <ChatGroup key={index} title={groupName}>
            {groupItems?.map((item) => (
              <ChatMenuItem
                key={item.id}
                href={`/chat/${item.id}`}
                chatThread={item}
              >
                {item.title.replace("\n", "")}
              </ChatMenuItem>
            ))}
          </ChatGroup>
        )
      )}
    </div>
  );
};

export const GroupChatThreadByType = (menuItems: Array<ChatThread>) => {
  const groupedMenuItems: Array<MenuItemsGroup> = [];

  // todays date
  const today = new Date();
  // 7 days ago
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  menuItems.sort(sortByTimestamp).forEach((el) => {
    if (el.bookmarked) {
      groupedMenuItems.push({
        ...el,
        groupName: "お気に入り",
      });
    } else if (new Date(el.lastMessageAt) > sevenDaysAgo) {
      groupedMenuItems.push({
        ...el,
        groupName: "最近",
      });
    } else {
      groupedMenuItems.push({
        ...el,
        groupName: "1週間以上前",
      });
    }
  });
  const menuItemsGrouped = groupedMenuItems.reduce((acc, el) => {
    const key = el.groupName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(el);
    return acc;
  }, {} as Record<MenuItemsGroupName, Array<MenuItemsGroup>>);

  const records: Record<MenuItemsGroupName, Array<MenuItemsGroup>> = {
    お気に入り: menuItemsGrouped["お気に入り"]?.sort(sortByTimestamp),
    最近: menuItemsGrouped["最近"]?.sort(sortByTimestamp),
    "1週間以上前": menuItemsGrouped["1週間以上前"]?.sort(sortByTimestamp),
  };

  return records;
};
