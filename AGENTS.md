# AGENTS.md - Development Guidelines for AI Coding Agents

## Project Overview
**fquotes** is a quote management application built with Astro 5.1.8 (SSR) + React 19 islands, featuring OCR-based quote capture, multilingual support (EN/ES/PT), and Google OAuth authentication. The frontend (this repo) proxies API calls to a separate backend service.

## Build & Development Commands

### Core Commands
```bash
pnpm dev              # Start dev server on port 3000
pnpm build            # Type-check (astro check) + build for production
pnpm preview          # Preview production build locally
```

### Type Checking
```bash
pnpm astro check      # Run TypeScript checks across .astro and .tsx files
```

### Database (Drizzle ORM)
```bash
npx drizzle-kit generate  # Generate migration from schema changes
npx drizzle-kit migrate   # Apply migrations to database
npx drizzle-kit studio    # Open Drizzle Studio GUI
```

**Note**: No testing framework is currently configured. Database operations happen in the backend service.

## Architecture Patterns

### Hybrid Astro + React Islands
- **Astro pages** (`.astro`): Server-rendered, file-based routing in `src/pages/`
- **React islands** (`.tsx`): Client-side interactivity with selective hydration
- **Hydration directives**: `client:load`, `client:idle`, `client:visible`
- **QueryProvider pattern**: Every React island must wrap its tree with `<QueryProvider>` to share TanStack Query cache

```tsx
// Standard pattern for all major React components
export const MyComponent = (props) => (
  <QueryProvider>
    <MyComponentInner {...props} />
  </QueryProvider>
);
```

### API Proxy Architecture
- All `/api/*` requests are proxied to backend service via `src/pages/api/[...path].ts`
- **Backend URL**: `PUBLIC_BACKEND_URL` (default: http://localhost:5000/api)
- **Auth URL**: `PUBLIC_BETTER_AUTH_URL` (default: http://localhost:5000)
- Frontend NEVER accesses database directly — all data operations via backend API

### Middleware Pipeline
Sequential execution in `src/middleware.ts`:
1. **authMiddleware** - Validates session, injects `Astro.locals.user` and `Astro.locals.session`
2. **localePreferenceMiddleware** - Cookie-based locale redirects (no client-side flash)
3. **i18nMiddleware** - Astro's i18n URL rewriting (manual routing)

## Code Style Guidelines

### Imports
**ALWAYS use absolute path aliases** (configured in `tsconfig.json`):
```typescript
// ✅ Correct
import { api } from "@/lib/api"
import { QuotesManager } from "@/components/quotes-manager"
import { useSearchQuotes } from "@/hooks/use-search-quotes"
import { t, type Locale } from "@/i18n"

// ❌ Wrong - never use relative imports
import { api } from "../../lib/api"
```

**Import order**:
1. External dependencies (React, Astro, third-party)
2. Internal components (`@/components/*`)
3. UI components (`@/components/ui/*`)
4. Hooks (`@/hooks/*`)
5. Utilities/lib (`@/lib/*`)
6. Types (`@/types/*` or inline types)

### TypeScript
- **Strict mode enabled** - All type errors must be fixed
- **No `any`** - Use `unknown` or proper types
- **Prefer type inference** - Explicit types only when necessary
- **Use Zod** for runtime validation (forms, API responses)
- **Drizzle schema** is source of truth for database types

```typescript
// ✅ Good - inferred types
const quotes = await api.get<Quote[]>("/quotes")

// ✅ Good - explicit when needed
interface QuotesManagerProps {
  locale: Locale
  initialQuotes?: Quote[]
}

// ❌ Bad - using any
const data: any = await response.json()
```

### React Components
- **Functional components only** (no class components)
- **Named exports** for components (not default exports)
- **Props interface** named `<ComponentName>Props`
- **Client directives** on Astro files: `<Component client:idle />` (prefer `idle` over `load`)

```tsx
// ✅ Good pattern
interface QuoteCardProps {
  quote: Quote
  onDelete: (id: string) => void
}

export const QuoteCard = ({ quote, onDelete }: QuoteCardProps) => {
  // Component logic
}
```

### State Management
- **TanStack Query** for server state (queries and mutations)
- **React useState** for local UI state
- **SessionStorage** for ephemeral persistence (bulk mode, selections)
- **Cookies** for user preferences (locale via `preferred-locale`)

**Custom hooks pattern**:
```typescript
// src/hooks/use-delete-quotes.ts
export function useDeleteQuotes() {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      return api.delete("/quotes", { ids })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
    },
    onError: (error) => {
      handleApiError(error, "Failed to delete quotes")
    },
  })
}
```

### Styling
- **Tailwind CSS only** - No inline styles or CSS modules
- **Use `cn()` utility** for conditional classes (from `@/lib/utils`)
- **Semantic color tokens** from CSS variables (see `src/styles/globals.css`)
- **Shadcn/ui components** for UI primitives (Button, Dialog, Dropdown, etc.)

```tsx
// ✅ Good - semantic tokens + cn utility
<div className={cn(
  "rounded-lg border",
  isActive ? "bg-primary/10 text-primary" : "bg-background-muted"
)} />

// ❌ Bad - hardcoded colors
<div className="bg-blue-500 text-white" />
```

### Error Handling
- **API errors**: Use `handleApiError()` from `@/lib/api-error`
- **Toast notifications**: Use `dispatchToastEvent()` for global toasts
- **Form validation**: Use Zod schemas + React Hook Form

```typescript
try {
  await api.post("/quotes", quoteData)
  dispatchToastEvent({ type: "success", message: "Quote saved!" })
} catch (error) {
  handleApiError(error, "Failed to save quote")
}
```

### Internationalization (i18n)
- **Three locales**: `en` (default), `es`, `pt`
- **Translation files**: `src/i18n/en.json`, `es.json`, `pt.json`
- **Translation function**: `t(locale, "key.path")` or `getTranslations(locale)`
- **Localized paths**: Use `getLocalizedPath("/path", locale)` for all internal links

```typescript
// In Astro components
const locale = (Astro.currentLocale || "en") as Locale
const t = getTranslations(locale)

// In React components (receive locale as prop)
<h1>{t(locale, "quotes.title")}</h1>
<a href={getLocalizedPath("/quotes", locale)}>View Quotes</a>
```

### Naming Conventions
- **Files**: `kebab-case.tsx`, `kebab-case.astro`
- **Components**: `PascalCase` (e.g., `QuoteCard`, `LanguageSwitcher`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useDeleteQuotes`)
- **Utilities**: `camelCase` (e.g., `handleApiError`, `cn`)
- **Types/Interfaces**: `PascalCase` (e.g., `Quote`, `User`, `ApiError`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `LOCALE_COOKIE_NAME`, `BACKEND_URL`)

## Common Patterns

### Toast System
```typescript
import { dispatchToastEvent } from "@/components/global-toast-manager"

dispatchToastEvent({
  type: "success", // "success" | "error" | "info"
  message: "Operation completed!",
  duration?: 3000, // Optional
})
```

### Query Keys Convention
```typescript
["quotes"]                    // All quotes
["quotes", { userId }]       // User-specific
["quotes", "search", query]  // Search results
["book-search", query]       // External API
```

### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateQuote,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["quotes"] })
    const previous = queryClient.getQueryData(["quotes"])
    queryClient.setQueryData(["quotes"], (old) => /* update */)
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["quotes"], context?.previous)
  },
})
```

## Key Files & Directories

```
src/
├── components/
│   ├── ui/              # Shadcn/Radix primitives (19 components)
│   ├── quotes-manager/  # Quote management feature
│   ├── capture/         # OCR & image capture
│   ├── auth/            # Authentication components
│   └── profile/         # User profile components
├── pages/
│   ├── api/[...path].ts # API proxy (catches all /api/* requests)
│   ├── index.astro      # Home/capture page
│   ├── quotes.astro     # Quotes list
│   └── profile.astro    # User profile
├── layouts/
│   └── layout.astro     # Main layout with navbar + footer
├── hooks/               # 10 custom React hooks
├── lib/
│   ├── api.ts           # API client with error handling
│   ├── auth-client.ts   # Better-Auth client config
│   ├── locale-cookie.ts # i18n cookie helpers
│   └── utils.ts         # cn() utility
├── db/
│   └── schema.ts        # Drizzle schema (8 tables)
├── i18n/                # Translation JSON files (en/es/pt)
└── middleware.ts        # Auth + locale + i18n middleware
```

## Important Constraints

1. **No database access** - This is frontend only. Use backend API for all data operations.
2. **No testing framework** - Tests not currently configured.
3. **Singleton QueryClient** - Always use `getQueryClient()` from `query-provider.tsx`.
4. **Cookie-based locale** - Never use localStorage for locale (causes double fetches).
5. **Manual i18n routing** - No automatic locale redirects; handled by custom middleware.
6. **Netlify deployment** - Build artifacts go to `dist/` via `@astrojs/netlify` adapter.
7. **Better-Auth session** - Session validation happens server-side in middleware, injected to `Astro.locals`.

## Environment Variables

Required in `.env` or `.env.local`:
```bash
PUBLIC_BACKEND_URL=http://localhost:5000/api
PUBLIC_BETTER_AUTH_URL=http://localhost:5000
PUBLIC_FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

## Debugging Tips

- **React Query DevTools** not installed - consider adding `@tanstack/react-query-devtools`
- **Check middleware logs** - Add `console.log` in `src/middleware.ts` for locale/auth issues
- **API proxy errors** - Check `src/pages/api/[...path].ts` and backend service logs
- **i18n issues** - Verify cookie `preferred-locale` value and URL pathname matching
- **Type errors** - Run `pnpm astro check` for full type checking report

---

**Last Updated**: March 2026 | **Astro**: 5.1.8 | **React**: 19 | **Node**: 18+
