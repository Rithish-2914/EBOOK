import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { BookGrid } from "@/components/book-grid";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Book } from "@shared/schema";

async function directUpload(formData: FormData) {
  const file = formData.get("file") as File;
  const thumbnail = formData.get("thumbnail") as Blob | null;
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  const urlResponse = await fetch("/api/books/get-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name }),
  });

  if (!urlResponse.ok) {
    throw new Error("Failed to get upload URL");
  }

  const {
    bookId,
    filePath,
    sanitizedFileName,
    thumbnailPath,
    fileUploadUrl,
    thumbnailUploadUrl,
  } = await urlResponse.json();

  const fileUploadResponse = await fetch(fileUploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: file,
  });

  if (!fileUploadResponse.ok) {
    throw new Error("Failed to upload file to storage");
  }

  let uploadedThumbnailPath = null;
  if (thumbnail && thumbnailUploadUrl && thumbnailPath) {
    const thumbUploadResponse = await fetch(thumbnailUploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: thumbnail,
    });
    if (thumbUploadResponse.ok) {
      uploadedThumbnailPath = thumbnailPath;
    }
  }

  const metadataResponse = await fetch("/api/books/save-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bookId,
      title,
      author,
      description,
      category,
      fileName: sanitizedFileName,
      fileSize: file.size,
      filePath,
      thumbnailPath: uploadedThumbnailPath,
    }),
  });

  if (!metadataResponse.ok) {
    const error = await metadataResponse.text();
    throw new Error(error || "Failed to save book metadata");
  }

  return metadataResponse.json();
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const uploadMutation = useMutation({
    mutationFn: directUpload,
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
