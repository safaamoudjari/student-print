# PrintPop 🎀 — Student Residence Printing App

A real, working printing-order web app for a small printing business inside a
university student residence. Students upload documents from their phones,
pick printing options, see the price instantly, and track their order until
it's ready to collect. The admin (the printing business owner) manages
everything from a separate dashboard.

This is a genuine MVP: every feature described below actually works end to
end against a real database — there is no mock data, no fake buttons, and no
hard-coded prices.

---

## 1. Features

**Students**
- Register / log in / edit profile
- Upload multiple documents (PDF, DOC, DOCX, JPG, PNG) per order
- Automatic PDF page counting (images count as 1 page; Word files use an
  honest "estimated" fallback — never a fake exact count)
- Choose black & white / color, single/double-sided, number of copies, and
  optional services (scanning, binding, stapling, …)
- Live price preview that updates instantly as options change
- Confirm the order and receive a unique order number (e.g. `PR-2026-00001`)
- Track order status with a visual timeline
- Cancel an order while it's still pending or confirmed

**Admin**
- Secure separate dashboard (statistics, orders, students, pricing, settings)
- View/download uploaded files, change order status, cancel orders
- Manage prices and optional services — nothing is hard-coded on the frontend
- Manage global settings: max file size, max files per order, max copies,
  file retention period
- Search and filter orders and students; sort by date or price
- Enable/disable student accounts

**Security**
- Passwords hashed with bcrypt, never stored in plain text
- JWT auth in an httpOnly cookie + role-based route protection
- Per-account brute-force lockout plus rate limiting on auth endpoints
- Files are never publicly accessible — every download goes through an
  authenticated endpoint that checks the requester owns the order (or is an
  admin)
- Uploaded files get random server-side filenames; the original filename and
  extension are validated, never trusted
- The **backend always recalculates the final price** from the current
  database prices and the real detected page count — a student can never
  change the price via browser dev tools

---

## 2. Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React + TypeScript + Tailwind CSS (Vite) |
| Backend   | Node.js + Express + TypeScript |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (httpOnly cookie) + bcrypt |
| Uploads   | Multer, stored on local disk (easy to swap for S3/Cloudinary later) |

---

## 3. Project structure

```
student-print/
├── client/                 React frontend
│   └── src/
│       ├── components/     Reusable UI (Navbar, cards, badges, layouts…)
│       ├── context/        AuthContext
│       ├── lib/            API client
│       ├── pages/          Route pages (public, student, admin)
│       └── types/          Shared TypeScript types
│
├── server/                 Express backend
│   └── src/
│       ├── config/         Env + DB connection
│       ├── controllers/    Route handlers
│       ├── middleware/     Auth, upload, error handling, rate limiting
│       ├── models/         Mongoose schemas
│       ├── routes/         Express routers
│       ├── scripts/        seed:admin, seed:services, cleanup:files
│       └── utils/          Price calculator, page counting, order numbers
│   └── tests/               Jest test suite
│
└── README.md                (this file)
```

---

## 4. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local MongoDB** (install MongoDB Community Server and run `mongod`), or
  - **MongoDB Atlas** (free tier) — create a cluster and copy its connection
    string

---

## 5. Installation

Open two terminals — one for the backend, one for the frontend.

### Backend

```bash
cd server
npm install
cp .env.example .env
```

Now edit `server/.env`:

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/student-print
# or your Atlas connection string, e.g.
# MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/student-print

JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
COOKIE_NAME=sp_token

ADMIN_EMAIL=admin@residence.local
ADMIN_PASSWORD=ChangeMe123!
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=Residence

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
MAX_FILES_PER_ORDER=10
```

> Generate a strong `JWT_SECRET` quickly with:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Frontend

```bash
cd client
npm install
```

The frontend already proxies `/api` to `http://localhost:4000` in
`vite.config.ts`, so you don't need a separate `.env` file for local
development.

---

## 6. Setting up the database

With MongoDB running and `server/.env` pointing at it, run these **once**
from the `server` folder:

```bash
# Create the first admin account (never hard-coded — comes from your .env)
npm run seed:admin

# Create the default price list (5 DA/page B&W, 25 DA/page color, scan,
# binding, stapling) so the pricing page and order form have real data
npm run seed:services
```

You can re-run `npm run seed:services` safely — it skips services that
already exist. You can change every price afterwards from the admin
dashboard's "Printing Settings" page.

---

## 7. Running it locally

**Terminal 1 — backend**
```bash
cd server
npm run dev
```
This starts the API on `http://localhost:4000` (health check at
`/api/health`).

**Terminal 2 — frontend**
```bash
cd client
npm run dev
```
This starts the app on `http://localhost:5173`. Open that URL in your
browser (or on your phone if it's on the same Wi-Fi network, using your
computer's local IP instead of `localhost`).

---

## 8. Testing the student flow

1. Go to `http://localhost:5173` → **Start Printing** → **Register**.
2. Fill in the form (first/last name, email, password, phone, room number)
   and submit — you're logged in immediately.
3. From the dashboard, click **New Printing Order**.
4. Upload a real PDF (or a JPG/PNG/DOCX) — you'll see the file listed with
   its size.
5. Choose Black & White or Color, single/double-sided, and a number of
   copies. Watch the live price update.
6. Continue to the review step, confirm the order, and note the generated
   order number (e.g. `PR-2026-00001`).
7. Go to **My Orders** to see it, and open it to see the status timeline.

## 9. Testing the admin flow

1. Log out, then log in with the admin credentials from your `.env`
   (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
2. You'll land on `/admin` — the **Overview** page with live statistics.
3. Go to **Orders**, find the order the student just created, and open it.
4. Download the uploaded file to confirm it actually works.
5. Click **Confirm order** → **Start printing** → **Mark as ready** →
   **Mark as collected**, and check the status updates live for the
   student too.
6. Go to **Printing Settings** to change a price (e.g. set color to 30
   DA/page) and confirm the pricing page updates immediately.
7. Go to **Students** to see the registered account, and try disabling /
   re-enabling it.
8. Go to **Settings** to change the max file size, max copies, or file
   retention period.

---

## 10. Running the automated tests

```bash
cd server
npm test
```

This covers: registration/login, unauthorized/forbidden access, price
calculation (black & white, color, copies, additional services), file-type
validation, order creation with backend-authoritative pricing, a student
being blocked from viewing another student's order, and cancelling an
order.

> The test suite uses `mongodb-memory-server`, which downloads a small
> MongoDB binary the first time you run it — this needs an internet
> connection but is a one-time download.

---

## 11. Automatic file deletion (retention)

Set **File retention (days)** in the admin **Settings** page (default: 7).
Deletion itself runs as a scheduled script rather than an always-on timer,
so you control exactly when it runs:

```bash
cd server
npm run cleanup:files
```

It only ever touches orders that are already `completed` and older than the
retention period — it removes the uploaded files and their records, but
always keeps the order's metadata (order number, price, dates, status) for
your records. Schedule it with your OS's scheduler, for example with cron
on Linux/macOS:

```
0 3 * * * cd /path/to/server && npm run cleanup:files >> cleanup.log 2>&1
```

---

## 12. Building for production

```bash
# Backend
cd server
npm run build      # compiles TypeScript to dist/
npm start          # runs dist/server.js

# Frontend
cd client
npm run build       # outputs client/dist — deploy as static files
```

In production:
- Set `NODE_ENV=production` in the server `.env`.
- Serve the frontend's `client/dist` folder from a static host or CDN (or
  behind the same reverse proxy as the API), and point it at your deployed
  API URL.
- Put the backend behind HTTPS (e.g. via Nginx + Let's Encrypt, or your
  hosting provider's managed TLS).
- Set a strong, unique `JWT_SECRET` and admin password — never reuse the
  example values.
- Point `MONGODB_URI` at your production database (Atlas is the easiest
  managed option).
- Make sure the `uploads/` folder is on persistent storage (not wiped on
  redeploy), or migrate to S3/Cloudinary (see below).

---

## 13. Migrating file storage to the cloud (optional, for later)

Uploaded files are currently stored on local disk under `server/uploads/`
and referenced by `storagePath` in the `OrderFile` model. To move to
S3/Cloudinary/Supabase Storage later:

1. Replace the `multer.diskStorage` in `server/src/middleware/upload.ts`
   with a cloud storage adapter (e.g. `multer-s3`).
2. Store the returned cloud key/URL in `storagePath` instead of a local
   path.
3. Update `downloadFile` in `server/src/controllers/fileController.ts` to
   stream/redirect from the cloud provider instead of `res.download`.

Because all file access already goes through this one controller, no other
part of the app needs to change.

---

## 14. Configuration that still needs your input

- **`.env` values** — especially `JWT_SECRET`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, and `MONGODB_URI`.
- **Default prices** — seeded from `server/src/scripts/seedServices.ts`;
  adjust them for real once from the admin dashboard.
- **HTTPS / domain** — this app is "HTTPS-ready" (secure cookies switch on
  automatically when `NODE_ENV=production`), but you'll need to put it
  behind a real TLS certificate when you deploy.
- **Antivirus scanning** — not included in this MVP. For real production
  use with a public printing shop, consider scanning uploads (e.g. with
  ClamAV) before an admin opens them.
- **Scheduling `cleanup:files`** — set up a cron job (or your host's
  scheduled tasks feature) if you want automatic file retention.

---

## 15. Ideas for Version 2

Roughly in order of usefulness for a small residence printing shop:

1. **WhatsApp/SMS notifications** when an order status changes (the
   database and UI are already structured for this — just add a
   notification service).
2. **QR code per order** so the admin can scan-to-confirm instead of typing.
3. **Online payment** (or at least "pay on collection" vs "already paid"
   tagging).
4. **PDF preview** in the admin order detail page, instead of only
   download.
5. **Per-file printing options** (e.g. one file in color, another in B&W)
   — the `OrderFile` model already has room to add this without a schema
   rewrite.
6. **Discount codes / loyalty points** for frequent students.
7. **Arabic and French localization** — the frontend copy is centralized
   enough to extract into translation files without restructuring
   components.
8. **Dark mode.**
9. **Multiple residences / multiple printers**, if the business expands.
10. **Email notifications and password reset** — currently the "Forgot
    password" page is honest that this isn't built yet and points students
    to contact the admin directly.

---

Made with 🎀 for the girls in the residence, one print at a time.
