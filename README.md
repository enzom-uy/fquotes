# QuoteKeeper

A web application to capture and save your favorite quotes from books.

## Features

- 📸 **Capture**: Use your camera to photograph text
- ✂️ **Crop**: Select the exact fragment you want
- 🤖 **Recognize**: Automatically extract the quotes

## Tech Stack

- **Framework**: Astro 5 with React 19
- **Styling**: Tailwind CSS v4 with Catppuccin dark theme
- **UI Components**: Shadcn/ui with Radix UI
- **Authentication**: JWT with Google OAuth
- **TypeScript**: Full type safety

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_TOKEN="your-secret-token"
REFRESH_SECRET_TOKEN="your-refresh-secret-token"
```

## Project Structure

```
src/
├── pages/              # Astro pages (routes)
│   ├── index.astro    # Landing page
│   └── create-profile.astro  # Profile creation with JWT
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── Logo.tsx
│   └── IndexCards.tsx
├── layouts/           # Astro layouts
│   └── Layout.astro
├── styles/            # Global styles
│   └── globals.css
└── lib/               # Utilities
    └── utils.ts
```

## Building for Production

```bash
pnpm build
```

## License

MIT
