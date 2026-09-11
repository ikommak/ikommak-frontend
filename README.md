# Ikommak frontend

The active customer-facing frontend for Ikommak: a Persian, RTL directory that helps people in Tehran find a repair shop for items such as watches, shoes, clothes, kitchen appliances, phones, and furniture.

This project intentionally preserves the newer blue/orange visual design. The older [`front`](../front) project is a reference only and is not the runtime application.

The broader system architecture and delivery tracker live in the backend documentation:

- [Architecture](../back/docs/ARCHITECTURE.md)
- [Importer and zero-cost data workflow](../back/docs/IMPORTER.md)
- [20-task delivery tracker](../back/docs/DELIVERY_STATUS.md)
- [Developer handoff and acceptance checklist](../back/docs/DEVELOPER_HANDOFF.md)
- [Executed and pending acceptance evidence](../back/docs/ACCEPTANCE_RUN.md)
- [Production deployment runbook](../back/docs/DEPLOYMENT.md)
- [Step-by-step MVP completion plan](../back/docs/superpowers/plans/2026-09-09-ikommak-mvp-completion.md)

## MVP scope

The launch service area is Tehran districts **1, 2, 3, 4, and 8**. The product will let a visitor search by repair need, inspect a shop, call it or open its Google Maps location, read Google and Ikommak reviews separately, and send a no-payment reservation request.

The app does not invent missing facts. A shop with no phone, rating, price, availability, or map link shows an honest missing-data state rather than sample data.

## Current implementation

The frontend implementation is in place and is undergoing final integrated acceptance:

- React Router routes for home, shop list/detail, reservation, confirmation, admin login/dashboard, and not-found pages.
- A centralized API client for `/api/v1`, including timeout, abort, JSON-envelope, and public/admin credential behavior.
- Feature API modules for catalog, reviews, reservations, and admin operations.
- Strict adapters that validate backend DTOs and convert safe IDs, numeric values, dates, nullable fields, locations, shops, reviews, and admin records into UI models.
- The existing Persian / RTL visual components and responsive home design.

The homepage now loads categories, launch districts, and recommended shops from the API in normal mode, with explicit mock mode for development. The `/shops` directory uses URL-backed filters and API pagination, with browser-local favorites. Applied filters appear as removable Persian chips; individual removal and clear-all update the URL, reset pagination, and work with direct links and browser history. Shop details reuse the same favorite store, load contact/map data, paginate Google and Ikommak reviews independently, and provide mobile sticky call/map/reservation controls without inventing missing facts. A guest can submit a review which remains pending until moderation. The reservation pages create retry-safe, no-payment requests and display a privacy-safe tracking receipt without claiming the booking is confirmed. Protected admin pages support cookie-session login, review moderation, and valid reservation status transitions. The accessibility pass adds skip links, keyboard-safe navigation, stable review labels, and explicit missing-data fallbacks. Stable API failures map to safe Persian messages.

On 2026-09-11, the active UI completed integrated API/MySQL browser acceptance. Public and admin flows, URL-backed search, pending review/reservation creation, moderation/transition, public visibility, logout, and protected-route redirect passed. Exact 1440×900 and 390×844 checks found no horizontal overflow across five core routes; mobile actions, keyboard menu/skip-link behavior, and the console were clean. The flow exposed and corrected fractional native-review aggregate validation; 73 frontend tests and the production build pass. Remaining release work is production deployment and recoverable version control.

## Run locally

Requirements: Node.js 20+ and the backend running on port `5001` for API mode.

```bash
cd /Users/hassan/git/github/ikommak-frontend
npm ci
npm run dev
```

Vite proxies `/api` to `http://localhost:5001` during local development.

## Environment

Copy `.env.example` to `.env.local` if you need to override defaults:

```dotenv
# Real application data (recommended; this is the intended production mode)
VITE_DATA_MODE=api
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

`VITE_DATA_MODE=mock` is reserved for explicit development/demo data. It must never silently replace an API failure in production. When deployed behind the same origin, `VITE_API_BASE_URL` can be omitted and defaults to `/api/v1`.

## Commands

```bash
npm test       # run Vitest tests
npm run build  # create a production build
npm run verify # run tests and the production build
npm run preview
```

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | API-backed homepage and discovery entry point |
| `/shops` | Repair-shop search, filters, pagination, and favorites |
| `/shops/:id` | Shop contact information and separate review sources |
| `/shops/:id/reserve` | No-payment reservation request form |
| `/reservations/:reference/success` | Privacy-safe request receipt and tracking reference |
| `/admin/login` | Administrator sign-in |
| `/admin` | Protected review and reservation queues |
| `*` | Branded not-found page |

The public layout includes a keyboard skip link, visible focus treatment, and an Escape-close mobile menu. Review and reservation forms use named controls and live status/error messaging. The document language and direction are declared as Persian RTL in `index.html`.

For deployment, configure the web server to return `index.html` for browser routes such as `/shops/123` and `/admin/login`, while forwarding `/api` to the backend.

## API expectations

The application uses only the versioned backend API. Collections return `{ data, pagination }`; single records return `{ data }`; failures return `{ error: { code, message, fields? } }`.

Public data is fetched without browser credentials. Admin calls use the server's HTTP-only session cookie and require exact backend CORS configuration. See [`../back/README.md`](../back/README.md) for API endpoints and backend setup.

## Product boundaries

This MVP has no customer accounts, payment, live availability, confirmed calendar bookings, SMS/email, or first-party map. Reservations are requests and start as `pending`.
