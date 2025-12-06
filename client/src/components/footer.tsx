import { Code2, Github, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg">
                DevNotes<span className="text-primary">ByRithish</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A curated collection of free programming ebooks for developers looking to enhance their skills.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>JavaScript</li>
              <li>Python</li>
              <li>React</li>
              <li>Web Development</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>All Books</li>
              <li>Upload Guide</li>
              <li>About</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted hover:bg-accent transition-colors"
                data-testid="link-github"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} DevNotesByRithish. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by Rithish
          </p>
        </div>
      </div>
    </footer>
  );
}
