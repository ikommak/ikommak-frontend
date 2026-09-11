# Frontend MVP — Task 1 report

## Scope delivered

- Added React Router 7 routing for the required public, reservation, admin, and catch-all routes. `App.jsx` is now a router shell; the prior homepage markup was moved intact to `src/pages/HomePage.jsx`.
- Added a jsdom Vitest/Testing Library harness with deterministic cleanup and `/api` development proxying to `http://localhost:5001` without URL rewriting.
- Added a fetch client with normalized `VITE_API_BASE_URL` (default `/api/v1`), public/admin credential separation, timeout/abort handling, and safe response-envelope errors.
- Added catalog, review, reservation, and admin request modules plus strict API-to-domain adapters and backend-matched Persian normalization.
- Added route, client, request-contract, and strict-adapter behavioral tests.

## Files changed

- Modified: `package.json`, `package-lock.json`, `vite.config.js`, `src/App.jsx`.
- Added: `src/app/router.jsx`; `src/api/{client,catalog,reviews,reservations,admin}.js`; `src/domain/{adapters,format}.js`; seven route page shells plus `HomePage.jsx`; and `src/test/{setup,helpers,api-client,adapters,router}`.

No files were changed outside `ikommak-frontend`. The production build output directory was removed after verification and is not part of the delivered changes.

## TDD evidence

Initial RED command:

```text
npm test -- src/test/api-client.test.js src/test/adapters.test.js src/test/router.test.jsx
```

It failed as intended with unresolved imports for `src/api/client.js`, `src/domain/adapters.js`, and `src/app/router.jsx` (three failed suites, before implementation existed).

Two additional RED checks were recorded after the initial implementation:

- an already-aborted caller signal initially resolved instead of rejecting as `AbortError`;
- a shop with no valid service price exposed `minPriceToman: null` instead of omitting the derived field.

Both were minimally fixed and the focused suite then passed.

## Final verification

```text
npm test
27 tests passed across 3 files (exit 0)

npm run build
vite v8.2.1 production build completed successfully (exit 0)
```

The build emitted an approximately 309 kB uncompressed JavaScript bundle and was then cleaned from `dist/` per task scope.

## Locked dependency versions

Runtime: `react-router-dom` `7.18.3`.

Dev: `vitest` `5.0.0`, `jsdom` `30.0.1`, `@testing-library/react` `16.3.3`, `@testing-library/dom` `10.4.1`, `@testing-library/user-event` `14.6.7`, and `@testing-library/jest-dom` `7.0.1`.

All are saved as exact versions in both `package.json` and `package-lock.json`.

## Decisions and concerns

- Public API calls explicitly use `credentials: 'omit'`; only `src/api/admin.js` requests pass the internal admin credential mode, which uses `include`.
- Domain IDs are strings. Optional unknown facts become `null`; a derived shop-level `minPriceToman` is present only when at least one valid `services[].minPriceToman` exists.
- Invalid external map URLs are discarded rather than exposed as links. Invalid required/envelope fields yield `ApiClientError` code `MALFORMED_RESPONSE` without preserving raw server data.
- There is no deployment target in this repository to document a host-specific SPA fallback. The Vite app itself has the full client route table; the eventual host must serve `index.html` for unmatched browser routes.

## Fix Round 1 — strict DTO review follow-up

### Backend contract verification

The reviewed frontend models were checked against the current backend output mappers before editing:

- `src/catalog/dto.js`: top-level districts expose `id`, `city`, `name`, and `slug`; shop districts expose only `id` and `name`; catalog services carry `minPriceToman`; detail DTOs include both review-summary objects.
- `src/reviews/service.js`: public/native reviews and admin reviews use camelCase DTOs, with admin review shop context nested at `shop` and user ratings restricted to integers 1–5.
- `src/reservations/service.js`: public receipts use `pending` after submission; admin reservations use nested `customer` and `shop` objects and the complete reservation status set.
- `src/admin/routes.js`: sessions use `{ authenticated, username }` inside `data`.

### Fixes

- `minPriceToman` is now always present on a shop summary: it is the minimum non-null, validated service price, including zero, or `null` when no service price is available.
- Catalog, shop, district, category, service, admin, and reservation IDs now require a positive safe integer (number or canonical decimal string) and normalize to strings. Review IDs also allow bounded nonempty opaque strings while rejecting unsafe/numeric-invalid/non-scalar input.
- Field-specific validators now enforce aggregate ratings `0..5`, native/user integer ratings `1..5`, nonnegative safe-integer counts/prices, and latitude/longitude bounds. Boolean availability is no longer coerced.
- Text and identity fields require strings; category/district/service slugs are validated; public and nested shop district shapes are separate; flattened admin DTO aliases are rejected.
- Public receipt status is limited to `pending`; admin reservations retain the complete server status set. Map URLs must be HTTP(S) with no embedded credentials.
- Removed the duplicate raw `listReviews` export from `api/catalog.js`; `api/reviews.js` is the sole public review reader and applies `toReview`.

### Fix Round 1 TDD evidence

Each behavior was first made RED, then changed minimally and rerun GREEN:

| Behavior | RED evidence | GREEN evidence |
| --- | --- | --- |
| Stable shop price | `src/test/adapters.test.js`: 1 failure — missing `minPriceToman` | 7/7 passed |
| Safe IDs / opaque reviews | 1 failure — object catalog ID accepted | 8/8 passed |
| Numeric/range validation | 1 failure — rating `5.1` accepted | 9/9 passed |
| Strict text, district shape, boolean availability | 1 failure — nested district leaked public fields | 10/10 passed |
| Receipt/admin/map strictness | 1 failure — credential-bearing map URL retained | 11/11 passed |
| Nested admin-review DTO | 1 failure — flattened alias accepted | 12/12 passed |
| Catalog resource ID URL validation | `src/test/api-client.test.js`: 1 failure — noncanonical ID accepted | 14/14 passed |
| Required detail summaries | `src/test/adapters.test.js`: 1 failure — missing summary accepted | 13/13 passed |
| Admin-review source | 1 failure — `google` source accepted in admin DTO | 13/13 passed |
| Strict pagination scalars | 1 failure — boolean page accepted | 13/13 passed |
| Review reader module boundary | `src/test/api-client.test.js`: 1 failure — raw catalog `listReviews` export present | 13/13 passed |
| Single-resource envelope | `src/test/adapters.test.js`: 1 failure — `toSingle({ data })` passed the envelope to the model adapter | 13/13 passed |

### Fix Round 1 final verification

```text
npm test
3 test files passed; 35 tests passed (exit 0)

npm run build -- --outDir /private/tmp/ikommak-frontend-build.rI9ZBx
Vite production build passed (exit 0)
```

The temporary build directory was removed after the successful build. Vite emitted its expected notice that an out-of-tree output directory is not automatically emptied; no project `dist/` directory was created or modified.

After the final single-envelope fix, verification was rerun: `npm test` again passed 35/35 tests, and `npm run build -- --outDir /private/tmp/ikommak-frontend-final2-build.BsaAX8` again exited 0. That temporary directory was removed immediately after verification.
