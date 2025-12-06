import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
  onDownload: (book: Book) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function BookCard({ book, onDownload }: BookCardProps) {
  return (
    <Card
      className="group flex flex-col overflow-visible transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      data-testid={`card-book-${book.id}`}
    >
      <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 via-primary/10 to-accent flex items-center justify-center rounded-t-lg border-b border-border">
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <FileText className="h-12 w-12 text-primary/60" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            PDF
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3
            className="font-semibold text-lg leading-tight line-clamp-2 mb-1"
            title={book.title}
            data-testid={`text-book-title-${book.id}`}
          >
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-book-author-${book.id}`}>
            by {book.author}
          </p>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-xs text-muted-foreground font-mono">
            {formatFileSize(book.fileSize)}
          </span>
        </div>

        <Button
          onClick={() => onDownload(book)}
          className="w-full gap-2"
          data-testid={`button-download-${book.id}`}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </Card>
  );
}
