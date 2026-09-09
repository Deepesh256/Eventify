# Event Management Backend

Node + Express + MongoDB + Nodemailer backend.

Steps:
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. Start MongoDB or set MONGO_URI to Atlas.
4. `npm run create-admin` (creates admin user)
5. `npm run dev` to start in dev mode.

Endpoints:
- POST /api/auth/login
- POST /api/events  (admin only)
- GET /api/events
- POST /api/events/:id/register
