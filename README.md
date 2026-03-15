# QuotesKeeper - Book Quote Capture App

Website to capture, save, and share your favorite quotes from books using OCR technology.

> **Developer's Note**: This project was created almost entirely with the help of [Claude](https://claude.ai), since front-end development drives me crazy. I was in charge of defining the requirements and providing feedback, while Claude handled most of the programming. If you have time and would like to support this project by building the front end using your skills, please contact me; I’d be happy to have you on board.

## Features

- **📸 OCR Quote Capture** - Use your camera to photograph book pages, crop the text, and automatically extract quotes using Tesseract.js
- **📚 Book Management** - Search and associate quotes with books via OpenLibrary API
- **🌍 Multilingual** - Full support for English, Spanish, and Portuguese
- **🔐 Google OAuth** - Secure authentication with Google
- **☁️ Cloudinary Integration** - Profile pictures are uploaded and managed via Cloudinary
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🎨 Beautiful UI** - Dark theme using Catppuccin Mocha with smooth animations

## Tech Stack

- **Framework**: Astro + React
- **Styling**: Tailwind CSS + Catppuccin theme
- **UI Components**: Shadcn/ui
- **Authentication**: Better-Auth with Google OAuth
- **OCR**: Tesseract.js
- **Image Processing**: react-image-crop, html-to-image
- **Database ORM**: Drizzle (schema only, backend handles operations)
- **Deployment**: Netlify

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
