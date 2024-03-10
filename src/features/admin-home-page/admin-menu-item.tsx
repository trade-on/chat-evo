"use client";
import { cn } from "@/ui/lib";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

interface AdminMenuItemProps {
  href: string;
  children?: React.ReactNode;
}

export const AdminMenuItem: FC<AdminMenuItemProps> = (props) => {
  const path = usePathname();
  console.log("path", path);
  return (
    <div className="flex group hover:bg-muted pr-3 text-muted-foreground rounded-sm hover:text-muted-foreground">
      <Link
        href={props.href}
        className={cn(
          "flex-1 flex items-center gap-2 p-3 overflow-hidden",
          path.endsWith(props.href) && props.href !== "/" ? "text-primary" : ""
        )}
      >
        {props.children}
      </Link>
    </div>
  );
};
