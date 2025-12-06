import { BookCard } from "./book-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Book } from "@shared/schema";
import { BookX } from "lucide-react";

interface BookGridProps {
  books: Book[];
  isLoading: boolean;
  onDownload: (book: Book) => void;
}

function BookCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <Skeleton className="aspect-[2/3] rounded-t-lg" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function BookGrid({ books, isLoading, onDownload }: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
          <BookX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No books found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search or category filter, or upload a new book to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onDownload={onDownload} />
      ))}
    </div>
  );
}
