import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Check, X, Edit2 } from "lucide-react";

interface EditableQuoteCardProps {
  text: string;
  index: number;
  onUpdate: (index: number, newText: string) => void;
}

export const EditableQuoteCard = ({
  text,
  index,
  onUpdate,
}: EditableQuoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleConfirm = () => {
    onUpdate(index, editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[120px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-accent text-background font-semibold hover:opacity-90"
            >
              <Check size={16} className="mr-2" />
              Confirm
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <p className="text-sm text-foreground flex-1 whitespace-pre-wrap">
            {text}
          </p>
          <Edit2
            size={16}
            className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          />
        </div>
        <p className="text-xs text-foreground-subtle mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit
        </p>
      </CardContent>
    </Card>
  );
};
