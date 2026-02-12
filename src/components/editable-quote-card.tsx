import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { TagsInput } from "./tags-input";
import { Check, X, Edit2, Eye, Heart } from "lucide-react";

export interface QuoteMetadata {
  text: string;
  chapter: string;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
}

interface EditableQuoteCardProps {
  metadata: QuoteMetadata;
  index: number;
  onUpdate: (index: number, metadata: QuoteMetadata) => void;
}

export const EditableQuoteCard = ({
  metadata,
  index,
  onUpdate,
}: EditableQuoteCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<QuoteMetadata>(metadata);

  const handleConfirm = () => {
    onUpdate(index, editedMetadata);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMetadata(metadata);
    setIsEditing(false);
  };

  const updateField = <K extends keyof QuoteMetadata>(
    field: K,
    value: QuoteMetadata[K],
  ) => {
    const updated = { ...editedMetadata, [field]: value };
    setEditedMetadata(updated);
    // Auto-save non-text fields immediately (no need to enter edit mode)
    if (field !== "text") {
      onUpdate(index, updated);
    }
  };

  if (isEditing) {
    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={editedMetadata.text}
            onChange={(e) =>
              setEditedMetadata((prev) => ({ ...prev, text: e.target.value }))
            }
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
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-4">
        {/* Quote text — click to edit */}
        <div
          className="cursor-pointer group"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-start gap-3">
            <p className="text-sm text-foreground flex-1 whitespace-pre-wrap">
              {metadata.text}
            </p>
            <Edit2
              size={16}
              className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            />
          </div>
          <p className="text-xs text-foreground-subtle mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to edit
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Metadata fields */}
        <div className="space-y-3">
          {/* Chapter */}
          <div className="space-y-1">
            <Label
              htmlFor={`chapter-${index}`}
              className="text-xs text-foreground-muted"
            >
              Chapter
            </Label>
            <Input
              id={`chapter-${index}`}
              value={metadata.chapter}
              onChange={(e) => updateField("chapter", e.target.value)}
              placeholder="e.g. Chapter 3, p. 42"
              className="h-8 text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label className="text-xs text-foreground-muted">Tags</Label>
            <TagsInput
              value={metadata.tags}
              onChange={(tags) => updateField("tags", tags)}
              placeholder="Add tags, separated by comma..."
            />
          </div>

          {/* Switches row */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`public-${index}`}
                checked={metadata.isPublic}
                onCheckedChange={(checked) => updateField("isPublic", checked)}
              />
              <Label
                htmlFor={`public-${index}`}
                className="text-xs text-foreground-muted flex items-center gap-1 cursor-pointer"
              >
                <Eye size={14} />
                Public
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`favorite-${index}`}
                checked={metadata.isFavorite}
                onCheckedChange={(checked) =>
                  updateField("isFavorite", checked)
                }
              />
              <Label
                htmlFor={`favorite-${index}`}
                className="text-xs text-foreground-muted flex items-center gap-1 cursor-pointer"
              >
                <Heart size={14} />
                Favorite
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
