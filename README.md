# 📖 EBOOK — Modern Digital Library & Publication Hub

> **A streamlined, responsive digital library platform for discovering, filtering, and downloading eBooks, courseware, and reading materials. Built with React, Vite, Tailwind CSS, Supabase PostgreSQL, and Express.**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**EBOOK** is an accessible open-access digital library web application designed to make books, lecture notes, research papers, and technical literature instantly readable and downloadable. It features instant multi-field search (title, author, genre), real-time download telemetry, and Supabase cloud persistence.

---

## ✨ Features

- **🔍 Real-Time Fuzzy Search**: Instant client-side search across book titles, authors, and keywords.
- **📥 Direct File Downloads**: Secure one-click asset downloading with animated toast progress and download count increments.
- **📚 Curated Book Cards**: High-definition cover display, page counts, genre categorization, and publication metadata.
- **⚡ Fast Cloud Backend**: Powered by Supabase PostgreSQL and Drizzle ORM for high throughput and zero latency.
- **📱 Responsive Reading Experience**: Clean typography and layouts tailored for mobile e-readers, tablets, and desktop displays.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Radix UI Primitives
- **State Management**: TanStack Query (React Query)
- **Backend**: Node.js, Express.js
- **Database & ORM**: PostgreSQL via Supabase, Drizzle ORM
- **Deployment**: Vercel ready

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Supabase PostgreSQL database

### 1. Clone the Repository
```bash
git clone https://github.com/Rithish-2914/EBOOK.git
cd EBOOK
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📂 Project Structure

```
EBOOK/
├── client/
│   ├── src/
│   │   ├── components/    # Header, HeroSection, BookGrid, BookCard, Footer
│   │   ├── pages/         # Home and reader views
│   │   └── App.tsx        # Application root
├── server/
│   ├── index.ts           # Express server
│   ├── routes.ts          # Book catalog and download APIs
│   └── db.ts              # Database connection
├── shared/
│   └── schema.ts          # Drizzle ORM schema
├── .env.example           # Environment template
├── LICENSE                # MIT License
└── README.md              # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
