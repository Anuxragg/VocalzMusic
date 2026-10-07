# VOCALZ

VOCALZ is a React music player with an Express API, MongoDB persistence, cookie-based authentication, Google sign-in, and Cloudinary media storage.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB database
- Cloudinary account for media uploads
- Google OAuth web client ID for Google sign-in

## Local setup

1. Install dependencies from the repository root:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the credentials. Keep `.env` out of version control.

3. Start the frontend and API together:

   ```sh
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string; `MONGODB_URI` is also accepted by the API |
| `JWT_SECRET` | Secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Separate secret for refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID used by the API |
| `VITE_GOOGLE_CLIENT_ID` | Same OAuth client ID exposed to the frontend build |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret; server-side only |
| `CLIENT_URL` | Allowed browser origin for the frontend |
| `FRONTEND_URL` | Optional second allowed browser origin |
| `NODE_ENV` | Set to `production` in production |
| `PORT` | API port; defaults to `5000` |

Use separate, randomly generated JWT secrets. Never add real credentials to `.env.example`, source files, or client-side `VITE_` variables, except public client IDs.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the frontend and API for local development |
| `npm run dev:web` | Start only the Vite frontend |
| `npm run dev:server` | Start only the API with file watching |
| `npm run build` | Build the production frontend into `dist/` |
| `npm run preview` | Preview the production frontend build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Node test suite |

## Deployment

The repository includes a Vercel configuration. Set the project root to this repository, use `npm run build` as the build command, and deploy `dist` as the static output. Configure all server environment variables in the hosting provider; configure `VITE_GOOGLE_CLIENT_ID` at build time.

Set `CLIENT_URL` (and optionally `FRONTEND_URL`) to the exact production frontend origin, including the scheme and host but no path. Production rejects state-changing requests whose `Origin` is missing or not allowlisted. Preview deployments need their own explicitly configured origin if they call the API directly.

## Security and operations

- Keep secrets in the hosting provider or local ignored `.env` file. Rotate any credential that has ever been committed.
- Use HTTPS in production and restrict MongoDB network access to the application environment.
- Use a least-privilege MongoDB account and enable backups before production data is stored.
- Keep `CLIENT_URL` and `FRONTEND_URL` restricted to trusted frontend origins.
- Keep Cloudinary and JWT secrets server-side; only public OAuth client IDs belong in frontend variables.
- Review dependency updates and run `npm audit` as part of release maintenance.
- Run `npm test`, `npm run lint`, and `npm run build` before deploying.
- Back up the database before running scripts that migrate, update, or delete records.

## API health

`GET /api/health` reports API health and whether required authentication configuration is present. It does not expose secret values.
