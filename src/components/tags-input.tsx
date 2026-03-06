import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  showCounter?: boolean;
}

export const TagsInput = ({
  value,
  onChange,
  placeholder = "Add tags separated by comma...",
  className,
  maxTags = 10,
  showCounter = false,
}: TagsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = (raw: string) => {
    // Check if we have space for new tags
    const remainingSlots = maxTags - value.length;
    if (remainingSlots <= 0) {
      // Don't add tags if we're at the limit, but clear the input
      return;
    }

    const newTags = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !value.includes(t));

    // Limit to available slots
    const tagsToAdd = newTags.slice(0, remainingSlots);

    if (tagsToAdd.length > 0) {
      onChange([...value, ...tagsToAdd]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTags(inputValue);
        setInputValue("");
      }
    }

    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTags(inputValue);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="rounded-sm hover:bg-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
      />
    </div>
  );
};
