import { AI_DESCRIPTION, AI_NAME } from "@/features/theme/theme-config";
import { Hero } from "@/features/ui/hero";
import { ScrollArea } from "@/features/ui/scroll-area";
import Image from "next/image";

export const ChatHome = () => {
  return (
    <ScrollArea className="flex-1">
      <main className="flex flex-1 flex-col gap-6 pb-6">
        <Hero
          title={
            <Image
              src={"/logo_with_text.png"}
              width={500}
              height={250}
              quality={100}
              alt="ai-icon"
            />
          }
          description={AI_DESCRIPTION}
        />
      </main>
    </ScrollArea>
  );
};
