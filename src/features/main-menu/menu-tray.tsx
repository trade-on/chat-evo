"use client";

import { cn } from "@/ui/lib";
import React from "react";
import { useMenuState } from "./menu-store";

export const MenuTray = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isMenuOpen } = useMenuState();
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-700 w-86 bg-secondary max-w-[240px]",
        isMenuOpen ? "translate-x-0" : "-translate-x-full -ml-86",
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  );
});
MenuTray.displayName = "MenuTray";
