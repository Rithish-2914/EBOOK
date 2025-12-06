import { Code2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UploadModal } from "./upload-modal";

interface HeaderProps {
  onUpload: (data: FormData) => Promise<void>;
  isUploading: boolean;
}

export function Header({ onUpload, isUploading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg md:text-xl">
            DevNotes<span className="text-primary">ByRithish</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UploadModal onUpload={onUpload} isUploading={isUploading} />
        </div>
      </div>
    </header>
  );
}
