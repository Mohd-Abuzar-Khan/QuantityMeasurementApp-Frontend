# QMA Frontend

Angular client for the **Quantity Measurement Application (QMA)**. It provides authentication (local login/register and Google OAuth2), a dashboard with an embedded measurement calculator, and a history view backed by the Spring Boot API.

## Prerequisites

- **Node.js** 18.x or newer (LTS recommended)
- **npm** (bundled with Node)

## Setup

```bash
cd frontend
npm install
```

## Development server

```bash
npm start
# or: npx ng serve
```

The dev server defaults to **http://localhost:4200** with the **development** build configuration.

Start the **Spring Boot** backend on **port 8080** so REST calls and OAuth work. The dev server uses `proxy.conf.json` to forward `/api` and `/oauth2` to `http://localhost:8080`, which helps avoid CORS issues during local development.

> **Note:** `src/environments/environment.ts` sets `apiUrl` to `http://localhost:8080/api/v1`. If you change backend host or port, update that file and rebuild.

## Build

| Command | Description |
|--------|-------------|
| `npm run build` | Production build (default Angular CLI configuration) |
| `npm run build:prod` | Same as `ng build --configuration production` |

Output is written to **`dist/qma-frontend/`**.

For a non-optimized build with source maps (easier debugging):

```bash
npx ng build --configuration=development
```

## Tests & lint

```bash
npm test    # Karma + Jasmine (unit tests)
npm run lint
```

## Project layout

| Path | Role |
|------|------|
| `src/app/core/` | Auth service, HTTP interceptors (JWT, errors), guards, shared models |
| `src/app/features/` | Feature modules: `auth`, `dashboard`, `measurement`, `history` (lazy-loaded) |
| `src/app/shared/` | Shell components (header, notifications) |
| `src/environments/` | Build-time environment (API base URL, OAuth entry URL) |

TypeScript path aliases (see `tsconfig.json`): `@core/*`, `@features/*`, `@shared/*`, `@environments/*`.

## Authentication flow (summary)

- **Username/password:** `POST /api/v1/auth/login` and `POST /api/v1/auth/register`; JWT stored in `localStorage` and sent via `Authorization: Bearer …`.
- **Google:** Browser navigates to Spring’s `/oauth2/authorization/google`; after success the backend redirects to `/oauth2/callback?token=…&email=…` on this app; the callback component stores the token and navigates to the dashboard.

Ensure the backend `app.oauth2.redirect-uri` matches the Angular URL for that callback (e.g. `http://localhost:4200/oauth2/callback` in development).

## Tech stack

- Angular **17**
- RxJS **7**
- SCSS styles
- Reactive forms for auth and measurement forms
