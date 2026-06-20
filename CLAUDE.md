# dine-frontend

## What This Is

Web-based POS dashboard, marketing site, and blog for DineOpen. Also builds as Electron desktop app and Capacitor mobile app.

## Tech Stack

- **Framework**: Next.js 15.5 with React 19 (App Router)
- **Styling**: Tailwind CSS 3.4
- **API Client**: Axios with custom ApiClient (caching, dedup, offline)
- **Auth**: Firebase (phone OTP + Google OAuth)
- **Real-time**: Firebase RTDB + Pusher
- **Offline**: IndexedDB (idb), better-sqlite3
- **Desktop**: Electron 33 (macOS/Windows)
- **Mobile**: Capacitor 6 (Android/iOS)
- **Analytics**: PostHog + Vercel Analytics
- **3D**: Three.js + React Three Fiber (product pages)
- **Charts**: Recharts
- **AI**: OpenAI Realtime API for voice features
- **i18n**: Custom lib with 9 languages
- **PDF**: @react-pdf/renderer

## Project Structure

```
src/
  app/                      # Next.js App Router
    (dashboard)/            # Protected routes (require auth)
      dashboard/page.js     # Main POS page (9162 lines!)
      menu/                 # Menu management
      orders/               # Order management
      inventory/            # Stock management
      tables/               # Table management
      customers/            # Customer CRM
      kot/                  # Kitchen order tickets
      analytics/            # Reports & charts
      hotel/                # Hotel features
      bookings/             # Reservations
      dineai/               # AI features
      billing/              # Invoicing
      attendance/           # Staff tracking
      admin/                # Settings
      home/                 # Home dashboard
      layout.js             # Auth gate + role-based nav
    products/               # Marketing pages (POS, Loyalty, Hotel, etc.)
    blog/                   # Blog system
    login/                  # Phone + Google auth
    local-login/            # Offline device login
    register/               # Signup
    onboarding/             # New user setup
    layout.js               # Root layout
    page.js                 # Landing page

  components/               # 54+ React components
    dineai/                 # AI voice/chat components
    delivery/               # Delivery features
    bookings/               # Booking components
    Sidebar.js              # Main navigation
    CommonHeader.js         # Header bar
    DineBot.js              # Chatbot interface
    BulkMenuUpload.js       # CSV/Excel menu import
    ...

  hooks/                    # 15+ custom hooks
    useFirebaseRealtime.js  # Real-time order updates
    useOrderNotifications.js # Order alerts
    useDineAI*.js           # AI voice hooks (4 variants)
    useAutoPrint.js         # Auto-print on new orders
    useKeyboard.js          # Keyboard shortcuts
    useSyncEngine.js        # Offline sync
    ...

  contexts/                 # React Context
    DineAIContext.jsx        # AI state
    LoadingContext.js        # Global loading
    CurrencyContext.js       # Multi-currency

  lib/
    api.js                  # ApiClient with caching + offline fallback
    i18n.js                 # Internationalization engine
    locales/                # en, hi, es, zh, ar, fr, pt, ja, de
    offlineDb.js            # IndexedDB wrapper

  utils/
    platform.js             # Detect Electron/Capacitor/Tauri/Web
    printBridge.js          # Print receipt abstraction
    printTemplates/         # Receipt HTML templates

  middleware.js             # Blog rewrites + geo-detection

electron/                   # Electron main process
  main.js                   # Window management
  preload.js                # IPC bridge

android/                    # Capacitor Android project
plugins/
  capacitor-dine-printer/   # Custom thermal printer plugin
```

## Key Patterns

- **App Router** with route groups: `(dashboard)` for protected routes
- **No UI library** — all custom Tailwind components (no MUI/Shadcn)
- **State via React Context** (not Redux)
- **ApiClient** with in-memory dedup, 5-min TTL cache, offline IndexedDB fallback
- **Platform detection** via `utils/platform.js` — code branches for Electron/Capacitor/Web
- **Blog** is pre-built HTML in `/public/blog/` with middleware rewrites for SEO
- **Dashboard page.js is 9162 lines** — the main POS interface, handles orders/tables/billing

## Auth Flow

1. Phone OTP or Google OAuth via Firebase
2. Token stored in localStorage + cookies
3. Dashboard layout.js checks auth + loads `pageAccess` from API
4. Role-based tab visibility via `ROUTE_ACCESS_MAP`
5. Offline mode: device login via `/local-login`

## Multi-Platform Builds

- **Web**: `npm run dev` (port 3002), deploy to Vercel
- **Desktop**: `npm run build:electron` → DMG/EXE via electron-builder
- **Android**: Capacitor build → Play Store
- **Auto-update**: electron-updater for desktop, Capacitor live update

## API Connection

- Dev: `http://localhost:3003`
- Prod: `https://dine-backend-lake.vercel.app`
- All requests via `lib/api.js` ApiClient with Bearer token

## Important Notes

- PWA/Service Worker disabled (Serwist compatibility issues with Next.js 15.5)
- Offline works via IndexedDB instead
- Multiple git remotes: origin (Kevin), origin2 (Vivek), origin3 (CI)
- Version tagging: `v1.4.8-fixN`
- Dashboard page is massive — be careful with changes to `(dashboard)/dashboard/page.js`

## Session Log

### 2026-05-28: Initial CLAUDE.md created
- Documented full architecture, platform support, component structure

### 2026-06-01: Print settings & delivery toggle
- Added receipt address/phone overrides in print settings
- Added showDelivery flag to bill layout toggles
- Fixed allRoles undefined error on admin tax tab

### 2026-06-01: Completed order item editing
- New backend endpoint `PATCH /api/orders/:orderId/edit-completed-items` with server-side pricing, inventory adjustment, auto-refund, edit history, and editCount
- OrderEditModal.js: added `mode` prop (`active`/`completed`) — hides Complete Billing, uses dedicated API
- Order history page: "Edit Details" (metadata) + "Edit Items" (full item editor) buttons for completed orders
- Edit reason required before editing, optional PIN verification via posSettings
- Bill templates: all 5 show "REVISED BILL (Edit #N)" banner when editCount > 0
- Auto-refund note created when edited total < original total
- Revenue stats automatically adjusted via updateDailyStatsRevenueDiff
- Admin page: PIN requirement toggle + PIN input in POS Settings > Advanced Features

### 2026-06-20: Dashboard V2 (Modern Dark Theme)
- Created `dashboard/v2/page.js` — full copy of V1 with dark polished theme
- Dark navy/slate palette: backgrounds (#0b1120, #0f172a, #1e293b), borders (#334155), text (#f1f5f9, #e2e8f0, #94a3b8)
- Horizontal category tabs (top bar instead of left sidebar)
- Slimmer 52px header with pill-shaped search, dark nav icons
- CSS overrides for shared components (MenuItemCard, OrderSummary) via `.menu-item-card` and `.v2-order-panel` classes
- Glassmorphism floating command bar with animated mic glow
- Admin page: Dashboard Version dropdown in POS Settings > General (Classic/Modern)
- V1↔V2 redirect logic based on `posSettings.dashboardVersion`
- Layout.js updated: `/dashboard/v2` added to `isDashboardPage` check
