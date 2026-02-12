import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Book, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";

export interface BookResult {
  title: string;
  author_name: string;
  bookId?: string;
  openlibraryId?: string;
  coverUrl?: string;
}

interface BookSearchProps {
  onSelect: (book: BookResult) => void;
  onClear?: () => void;
  selectedBook: BookResult | null;
  className?: string;
}

const BACKEND_URL =
  import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:5000/api";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export const BookSearch = ({
  onSelect,
  onClear,
  selectedBook,
  className,
}: BookSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 400);

  const searchBooks = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/book/search?query=${encodeURIComponent(searchQuery)}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: BookResult[] = await response.json();
      console.log(data);
      setResults(data);
    } catch (error) {
      console.error("Error searching books:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchBooks(debouncedQuery);
  }, [debouncedQuery, searchBooks]);

  const handleSelect = (book: BookResult) => {
    onSelect(book);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!open && e.target.value.trim().length >= 2) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2 && results.length > 0) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Selected book card — above the input */}
      {selectedBook && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-primary/30 bg-background-elevated p-2">
          {selectedBook.coverUrl ? (
            <img
              src={selectedBook.coverUrl}
              alt={selectedBook.title}
              width={36}
              height={54}
              className="h-[54px] w-[36px] flex-shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex h-[54px] w-[36px] flex-shrink-0 items-center justify-center rounded bg-background-muted">
              <Book className="h-4 w-4 text-foreground-muted" />
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-tight">
              {selectedBook.title}
            </span>
            <span className="truncate text-xs text-foreground-muted leading-tight">
              {selectedBook.author_name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onClear?.()}
            className="flex-shrink-0 rounded-md p-1 text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
            title="Remove selected book"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={selectedBook ? "Search for a different book..." : "Search for a book..."}
              className="pl-9 pr-9"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-foreground-muted" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width]"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {results.length === 0 &&
                !isLoading &&
                query.trim().length >= 2 && (
                  <CommandEmpty>No books found.</CommandEmpty>
                )}
              {results.length === 0 &&
                !isLoading &&
                query.trim().length < 2 && (
                  <CommandEmpty>
                    Type at least 2 characters to search.
                  </CommandEmpty>
                )}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-foreground-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              )}
              {results.length > 0 && (
                <CommandGroup>
                  {results.map((book, index) => {
                    const isSelected =
                      selectedBook?.title === book.title &&
                      selectedBook?.author_name === book.author_name;

                    return (
                      <CommandItem
                        key={`${book.title}-${book.author_name}-${index}`}
                        onSelect={() => handleSelect(book)}
                        className="flex items-start gap-3 py-3 px-3 cursor-pointer"
                      >
                        {book.coverUrl ? (
                          <div className="flex-shrink-0">
                            <img src={book.coverUrl} height={50} width={50} className="rounded" />
                          </div>
                        ) : (
                          <Book className="h-4 w-4 mt-0.5 flex-shrink-0 text-foreground-muted" />
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {book.title}
                          </span>
                          <span className="text-xs text-foreground-muted truncate">
                            {book.author_name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="ml-auto h-4 w-4 flex-shrink-0 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
