import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PromptCardContextMenu } from "./prompt-card-context-menu";
import { Prompt } from "@prisma/client";

interface Props {
  prompt: Prompt;
  showContextMenu: boolean;
}

export const PromptCard: FC<Props> = (props) => {
  const { prompt } = props;
  return (
    <Card key={prompt.name} className="flex flex-col">
      <CardHeader className="flex flex-row">
        <CardTitle className="flex-1">{prompt.name}</CardTitle>
        {props.showContextMenu && (
          <div>
            <PromptCardContextMenu prompt={prompt} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1">
        {prompt.description.length > 100
          ? prompt.description.slice(0, 100).concat("...")
          : prompt.description}
      </CardContent>
    </Card>
  );
};
