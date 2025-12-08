import { Code2, ExternalLink } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
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
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="link-portfolio"
          >
            <a
              href="https://rithishbajjuri.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            data-testid="link-instagram"
          >
            <a
              href="https://www.instagram.com/rithish.codes/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiInstagram className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
