# QuoteKeeper

A web application to capture, save, and share your favorite quotes from books using OCR technology.

> **Note**: This project was built almost entirely with the assistance of [Claude](https://claude.ai), an AI coding assistant. The developer provided requirements and feedback, while Claude implemented the majority of the code.

## Features

- **📸 OCR Quote Capture** - Use your camera to photograph book pages, crop the text, and automatically extract quotes using Tesseract.js
- **📚 Book Management** - Search and associate quotes with books via OpenLibrary API
- **🌍 Multilingual** - Full support for English, Spanish, and Portuguese
- **🔐 Google OAuth** - Secure authentication with Google
- **☁️ Cloudinary Integration** - Profile pictures are uploaded and managed via Cloudinary
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🎨 Beautiful UI** - Dark theme using Catppuccin Mocha with smooth animations

## Tech Stack

- **Framework**: Astro 5.1.8 (SSR mode)
- **UI Library**: React 19 with islands architecture
- **Styling**: Tailwind CSS + Catppuccin theme
- **UI Components**: Shadcn/ui + Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Authentication**: Better-Auth with Google OAuth
- **OCR**: Tesseract.js 7.0
- **Image Processing**: react-image-crop, html-to-image
- **Forms**: React Hook Form + Zod validation
- **Database ORM**: Drizzle (schema only, backend handles operations)
- **Deployment**: Netlify (SSR adapter)

## Project Structure

```
src/
├── components/           # React and Astro components
│   ├── ui/              # Shadcn/Radix UI primitives
│   ├── capture/         # OCR & image capture (Tesseract.js)
│   ├── quotes-manager/  # Quote management feature
│   ├── profile/         # User profile components
│   ├── auth/            # Authentication components
│   └── settings/        # Settings pages
├── pages/               # Astro file-based routing
│   ├── api/[...path].ts  # API proxy to backend
│   ├── index.astro      # Home/capture page
│   ├── quotes.astro     # Quotes list
│   ├── profile.astro    # User profile
│   └── settings.astro   # User settings
├── hooks/               # Custom React hooks (TanStack Query)
├── lib/                 # Utilities (API client, auth, utils)
├── i18n/                # Translation files (en/es/pt)
├── db/                  # Drizzle schema
├── middleware.ts        # Auth + locale + i18n middleware
└── styles/              # Global CSS with CSS variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A running backend service (see below)

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API (your separate backend service)
PUBLIC_BACKEND_URL=http://localhost:5000/api

# Better-Auth (your auth service)
PUBLIC_BETTER_AUTH_URL=http://localhost:5000

# Frontend URL
PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Development

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Architecture Notes

### Frontend-Only Design

This repository is **frontend-only**. It does not directly access the database. All data operations go through a separate backend service via the API proxy at `src/pages/api/[...path].ts`.

### API Proxy

All requests to `/api/*` are proxied to the backend service. This keeps sensitive credentials (database, Cloudinary, etc.) on the backend.

### Authentication

- Sessions are validated server-side via middleware
- User data is injected into `Astro.locals.user` and `Astro.locals.session`
- Google OAuth flow handled by Better-Auth on the backend

### Internationalization

- Three locales: English (default), Spanish, Portuguese
- Cookie-based locale preference (no localStorage)
- Server-side redirects for locale switching (no client-side flash)

## Backend Service

This frontend requires a separate backend service to handle:
- Database operations (PostgreSQL)
- Authentication (Better-Auth)
- Image uploads to Cloudinary
- OCR processing (optional, can be done frontend-side)

## License

MIT
