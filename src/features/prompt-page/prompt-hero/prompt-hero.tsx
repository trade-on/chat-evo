"use client";
import { Hero, HeroButton } from "@/features/ui/hero";
import { Book, BookImage, NotebookPen } from "lucide-react";
import { promptStore } from "../prompt-store";

export const PromptHero = () => {
  return (
    <Hero
      title={
        <>
          <Book size={36} strokeWidth={1.5} /> プロンプト管理
        </>
      }
      description={
        "Prompt templates are statements or questions meant to help users get creative without having to come up with ideas from scratch."
      }
    >
      <HeroButton
        title="プロンプトを追加する"
        description="あなたがよく使う指示を保存できます"
        icon={<Book />}
        onClick={() => promptStore.newPrompt()}
      />
      {/* <HeroButton
        title="Whimsical City"
        description="Image of miniature colourful city "
        icon={<BookImage />}
        onClick={() =>
          promptStore.updatePrompt({
            createdAt: new Date(),
            id: "",
            name: "Whimsical City",
            description:
              "Create A miniature city with colourful buildings and green trees with [iconic building]. The [iconic building] is in the centre of the image, surrounded by a blurred background with lots of [Native tree name] trees. The image has a dreamy and whimsical mood, with a shallow depth of field and a high angle view. The city looks like a toy or a model, with different styles and shapes of buildings.",
            isPublished: false,
            // type: "PROMPT",
            userId: "",
            updatedAt: new Date(),
          })
        }
      />
      <HeroButton
        title="Problem Framing"
        description="Problem Framing for a new product"
        icon={<NotebookPen />}
        onClick={() =>
          promptStore.updatePrompt({
            createdAt: new Date(),
            id: "",
            name: "Problem Framing",
            description: `
Given the following problem statement:
[PROBLEM STATEMENT]

Generate a response with the following points:
1. Problem framing
2. Solution overview and recommendations 
3. List down the recommended MVP Scope
4. How to ensure user adoption
5. How to measure success 
8. List down similar products
9. Potential sponsor question (5 questions) 
              `,
            isPublished: false,
            // type: "PROMPT",
            userId: "",
            updatedAt: new Date(),
          })
        }
      /> */}
    </Hero>
  );
};
