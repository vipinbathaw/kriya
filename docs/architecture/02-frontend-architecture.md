# Frontend Architecture

## Stack
- **Framework**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Server State**: TanStack Query v5
- **Client State**: Zustand
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **HTTP Client**: TanStack Query's built-in fetch or ky
- **Testing**: Vitest + React Testing Library
- **Mobile (Future)**: React Native (Expo)

## Component Architecture

```
pages/              # Route-level components (one per route)
  ├── LoginPage.tsx
  ├── NotesListPage.tsx
  ├── FinanceListPage.tsx
  ├── NutritionListPage.tsx
  └── SettingsPage.tsx

components/
  ├── layout/       # App shell, sidebar, navbar, theme toggle
  │   ├── AppLayout.tsx
  │   ├── Sidebar.tsx
  │   ├── Navbar.tsx
  │   └── ThemeToggle.tsx
  ├── shared/       # Cross-module components
  │   ├── TagInput.tsx
  │   ├── TagBadge.tsx
  │   ├── ConfirmDialog.tsx
  │   ├── LoadingSpinner.tsx
  │   └── EmptyState.tsx
  ├── notes/        # Notes module components
  │   ├── NoteCard.tsx
  │   ├── NoteForm.tsx
  │   └── NoteList.tsx
  ├── finance/      # Finance module components
  │   ├── EntryRow.tsx
  │   ├── EntryForm.tsx
  │   ├── EntryList.tsx
  │   └── BalanceSummary.tsx
  └── nutrition/    # Nutrition module components
      ├── FoodEntryCard.tsx
      ├── FoodEntryForm.tsx
      ├── NutritionSummary.tsx
      └── NutritionBreakdown.tsx
```

## Routing

```
/login              → Login
/register           → Registration
/verify-email       → Email verification
/                   → Dashboard (protected)
/notes              → Notes list (protected)
/notes/new          → Create note (protected)
/notes/:id          → Note detail (protected)
/notes/:id/edit     → Edit note (protected)
/finance            → Finance entries list (protected)
/finance/new        → Create entry (protected)
/finance/:id        → Finance detail (protected)
/finance/:id/edit   → Edit entry (protected)
/nutrition          → Nutrition entries list (protected)
/nutrition/new      → Create entry (protected)
/nutrition/:id      → Nutrition detail (protected)
/settings           → User settings (protected)
```

## State Management Strategy

### Server State (TanStack Query)
- All API data: notes, finance entries, nutrition entries
- Cached, auto-refetched, optimistically updated
- Query keys follow convention: `['resource', 'list', filters]` and `['resource', id]`

### Client State (Zustand)
- UI state only: sidebar open/closed, theme preference
- Form state via React Hook Form (not stored globally)
- Auth tokens stored in httpOnly cookies (not in Zustand)

### Theme
- Tailwind `dark` class on `<html>`
- Zustand store persists theme preference to localStorage
- System preference detected via `prefers-color-scheme` media query
- Manual toggle exposed in navbar

## Mobile Responsiveness
- Mobile-first design with Tailwind breakpoints
- Bottom navigation bar on mobile, sidebar on desktop
- Touch-friendly target sizes (min 44x44px)
- Swipe gestures for delete/archive (future)

## Future Mobile App Considerations
- API layer is already RESTful — React Native app consumes same endpoints
- Authentication via JWT tokens (stored in SecureStore)
- Future SMS reading via react-native-sms-android
- Future notification reading via react-native-notification-list
- Shared Zod schemas between web and mobile (as npm workspace)
