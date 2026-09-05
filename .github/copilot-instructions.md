# Copilot instructions for Rect

## Project overview

This repository is a Vite + React single-page application for an employee payroll system. The app is organized around route-level pages, shared UI components, a central API client, and an auth context that persists state in `localStorage`.

## Build, test, and validation commands

Run these from the repository root:

- Install dependencies: `npm install`
- Start the dev server: `npm run dev -- --host`
- Create a production build: `npm run build`
- Preview the production build: `npm run preview -- --host`

There are no `test` or `lint` scripts defined in `package.json`, so there is no project-level unit-test or lint command to run. For validation in this repo, use the Vite build and the browser/dev server workflow.

## High-level architecture

- `src/main.jsx`: app bootstrap; wraps the app in `BrowserRouter` and `AuthProvider`.
- `src/App.jsx`: route tree. The app uses private routes and redirects unauthenticated users to `/login`.
- `src/context/AuthContext.jsx`: centralized authentication state. It handles login, register, logout, refresh token persistence, and exposes `user`/`loading` via React context.
- `src/services/api.js`: shared Axios instance with a `/api` base URL, auth header injection, and automatic refresh-token retry behavior.
- `src/components/Layout.jsx`: shell for authenticated pages, includes left navigation and role-aware actions.
- `src/pages/*`: page-level screens for dashboard, employees, employee management, payroll list, and payroll generation.
- `src/index.css`: shared styling for the app shell, forms, tables, buttons, alerts, and dashboard cards.

The typical flow is: login/register -> auth context stores tokens in `localStorage` -> protected page components call `api.*` endpoints -> role checks determine whether actions like adding employees or generating payroll are visible.

## Key conventions

- Prefer the shared `api` client instead of creating ad hoc `fetch` or `axios` calls.
- Keep route-level screens in `src/pages` and reusable UI in `src/components`.
- Treat the backend response envelope as the API contract: success paths generally look like `{ success: true, data: ... }`, while failures use `data.message`.
- Authentication state lives in `AuthContext` and is persisted in `localStorage`; do not duplicate session logic in individual pages.
- Role checks are part of the UI contract. `Admin` and `HR` users are allowed to create/edit/deactivate employees and generate payroll; the layout uses those checks to show or hide nav links.
- If you add a new page under the protected area, wire it into `src/App.jsx` under the authenticated `/` route tree rather than creating a separate top-level router.
- Currency formatting follows INR conventions in the UI via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- The project has a strong page-per-feature structure; prefer adding new employee/payroll logic alongside the existing route modules instead of inventing a separate app-level store unless the feature truly needs it.

## Working style for this repo

- Keep changes scoped to the existing React/Vite patterns rather than introducing a new framework or state-management library.
- When modifying routes or auth behavior, check both the route setup in `src/App.jsx` and the auth provider in `src/context/AuthContext.jsx`.
- When adding backend integrations, follow the existing axios interceptor pattern in `src/services/api.js` so token refresh and auth headers remain consistent.
