import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title: string;
}

export const ChatGroup = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="text-sm font-regular text-foreground p-3">
        {props.title}
      </div>
      <div className="pl-2">{props.children}</div>
    </div>
  );
};
