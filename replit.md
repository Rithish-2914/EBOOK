# DevNotesByRithish

## Overview

DevNotesByRithish is a curated ebook library platform for developers. The application allows users to browse, search, filter, and download programming books across various categories (JavaScript, Python, React, Node.js, TypeScript, Web Development, Data Science, DevOps, Mobile Development, Database, Machine Learning, and System Design). The platform features a clean, developer-focused design with both light and dark theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library

**Design System:**
- Custom Tailwind configuration with extended color palette (defined in CSS variables)
- Typography hierarchy using Inter (primary), JetBrains Mono (code/labels)
- Consistent spacing units (2, 4, 6, 8, 12, 16, 20)
- Responsive grid patterns for different screen sizes
- Theme provider for light/dark mode switching with localStorage persistence

**Component Structure:**
- Atomic design pattern with reusable UI components in `/client/src/components/ui/`
- Feature components (BookCard, BookGrid, CategoryFilter, Header, HeroSection, Footer, etc.)
- Theme-aware components using CSS custom properties
- Form handling with React Hook Form and Zod validation

**Key Architectural Decisions:**
- **Client-side rendering** with Vite as build tool for fast development experience
- **Type-safe API calls** using shared schema definitions between client and server
- **Optimistic UI updates** via React Query mutations
- **CSS-in-JS avoided** in favor of Tailwind utility classes for performance

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **File Upload**: Multer (in-memory storage with 50MB limit)
- **Session Management**: PostgreSQL-based sessions via connect-pg-simple

**API Design:**
- RESTful endpoints under `/api/` prefix
- File upload endpoint with PDF validation
- JSON request/response format
- Error handling with appropriate HTTP status codes

**Server Structure:**
- Modular route registration in `server/routes.ts`
- Storage abstraction layer (`IStorage` interface) with in-memory implementation
- Static file serving for production builds
- Development mode with Vite middleware integration

**Key Architectural Decisions:**
- **In-memory storage as default** with interface for easy database migration
- **File buffering** in memory (non-persistent across server restarts)
- **Monorepo structure** with shared schema definitions in `/shared/`
- **Single build output** combining client and server for deployment

### Data Storage Solutions

**Database Schema (Drizzle ORM with PostgreSQL):**

**Users Table:**
- `id` (varchar, primary key, UUID)
- `username` (text, unique, not null)
- `password` (text, not null)

**Books Table:**
- `id` (varchar, primary key, UUID)
- `title` (text, not null)
- `author` (text, not null)
- `description` (text, nullable)
- `category` (text, not null - constrained to predefined categories)
- `fileName` (text, not null)
- `fileSize` (integer, not null)
- `downloadCount` (integer, default 0)

**Storage Implementation:**
- `MemStorage` class provides in-memory data store for development
- File storage uses Map<bookId, Buffer> for PDF content
- `IStorage` interface defines contract for future database implementations
- Drizzle schema provides type-safe database operations when PostgreSQL is connected

**Key Architectural Decisions:**
- **Schema-first approach** using Drizzle ORM with Zod validation
- **Type sharing** between frontend and backend via shared schema exports
- **Flexible storage layer** allowing easy transition from in-memory to database
- **Session persistence** ready via connect-pg-simple when database is available

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui configuration with "new-york" style preset
- Lucide React for consistent iconography

**Development Tools:**
- Vite for build and development server
- TypeScript for type safety across the stack
- ESBuild for server-side bundling in production
- PostCSS with Autoprefixer for CSS processing

**Runtime Dependencies:**
- Express.js for HTTP server
- Multer for multipart form data handling
- TanStack Query for data fetching and caching
- date-fns for date manipulation
- nanoid for ID generation

**Database & ORM:**
- Drizzle ORM for type-safe database queries
- drizzle-zod for schema validation
- pg (PostgreSQL driver) when database is provisioned
- connect-pg-simple for session storage

**Development-Specific:**
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code navigation
- @replit/vite-plugin-dev-banner for development indicator

**Key Integration Points:**
- Environment variable `DATABASE_URL` for PostgreSQL connection
- Google Fonts CDN for Inter and JetBrains Mono typography
- File system for static asset serving in production
- Browser localStorage for theme preference persistence