# NowaSolKurier (MVP)

A full-stack MVP for generating parcel shipping labels for local businesses in Nowa Sól. Users can register, log in, get courier quotes, create shipments, and download labels.

## Tech Stack
- Frontend: React + TypeScript + Axios + React Router (Vite)
- Backend: NestJS + TypeORM + PostgreSQL + Passport (JWT)
- DB: PostgreSQL
- Deployment: Docker (multi-stage) + Nginx (serves frontend and proxies `/api` to backend)

## Quickstart (Docker)
1. Copy env file:
```bash
cp .env.example .env
```
2. Start stack:
```bash
docker compose up --build
```
3. Open the app at `http://localhost`.

## Services
- Frontend: `http://localhost` (Nginx)
- Backend API: `http://localhost/api` (proxied to NestJS at `backend:3000`)
- Postgres: internal only (`postgres:5432`)

## Environment Variables
See `.env.example`. For local Docker, defaults are fine.

- `CORS_ORIGIN` – comma-separated list of origins allowed to call the API. If unset, all origins are permitted.
- `VITE_API_URL` – base URL of the backend API used by the frontend (include the `/api` prefix, e.g. `https://your-backend.onrender.com/api`).

## Local Development (without Docker)
- Start Postgres locally and set env vars in `.env`.
- Backend:
```bash
cd backend
npm install
npm run start:dev
```
- Frontend:
```bash
cd frontend
npm install
npm run dev
```
- App at `http://localhost:5173`, API at `http://localhost:3000`.

## Features Implemented
- User registration and JWT login
- List couriers
- Get quotes based on parcel dimensions and weight (MVP heuristic)
- Create shipment with selected courier
- View shipment history
- Download label (simple text content as a file)

## Notes
- TypeORM `synchronize` is enabled for MVP. Do not use in production.
- Courier quote logic is a simple heuristic for demo purposes.
- Label download returns a text file; swap with real PDF service later.

## License
MIT
