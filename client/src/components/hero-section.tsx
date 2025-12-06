import { Book, Code2, Download, Users } from "lucide-react";
import { SearchBar } from "./search-bar";

interface HeroSectionProps {
  bookCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function HeroSection({ bookCount, searchValue, onSearchChange }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Code2 className="h-4 w-4" />
              Free Programming Resources
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              DevNotes
              <span className="text-primary">ByRithish</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Curated collection of programming ebooks for developers. Download free PDF books on JavaScript, Python, React, and more.
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{bookCount}+</p>
                  <p className="text-muted-foreground">Books</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Free</p>
                  <p className="text-muted-foreground">Downloads</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">12</p>
                  <p className="text-muted-foreground">Categories</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search for books by title or author..."
                className="max-w-md"
              />
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4 p-4">
                {[
                  { title: "JavaScript", color: "from-yellow-400/20 to-yellow-600/20" },
                  { title: "Python", color: "from-blue-400/20 to-blue-600/20" },
                  { title: "React", color: "from-cyan-400/20 to-cyan-600/20" },
                  { title: "TypeScript", color: "from-blue-500/20 to-blue-700/20" },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className={`aspect-[2/3] w-28 rounded-lg bg-gradient-to-br ${item.color} border border-border/50 flex items-center justify-center transform ${
                      i % 2 === 0 ? "-rotate-3" : "rotate-3"
                    } ${i < 2 ? "-translate-y-2" : "translate-y-2"} shadow-lg hover:scale-105 transition-transform`}
                  >
                    <span className="font-mono text-xs text-muted-foreground">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
