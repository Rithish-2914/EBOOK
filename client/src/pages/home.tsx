import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { BookGrid } from "@/components/book-grid";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Book uploaded!",
        description: "Your book has been added to the library.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (book: Book) => {
    try {
      const response = await fetch(`/api/books/${book.id}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = book.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      
      toast({
        title: "Download started",
        description: `Downloading "${book.title}"`,
      });
    } catch {
      toast({
        title: "Download failed",
        description: "Unable to download the book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    
    const query = searchQuery.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onUpload={async (data) => {
          await uploadMutation.mutateAsync(data);
        }}
        isUploading={uploadMutation.isPending}
      />
      
      <main className="flex-1">
        <HeroSection
          bookCount={books.length}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl md:text-2xl font-semibold">
              All Books
              <span className="text-muted-foreground font-normal ml-2">
                ({filteredBooks.length})
              </span>
            </h2>
          </div>
          
          <BookGrid
            books={filteredBooks}
            isLoading={isLoading}
            onDownload={handleDownload}
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
