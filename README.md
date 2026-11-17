# Product Management System

A product management web application built with **Next.js** and **PocketBase**.
As a proof of concept it manages ten laptop models (4 Dell, 4 Lenovo, 2 Acer):
users can add, view, update and delete laptops through a web interface, and all
data is stored in PocketBase and accessed through Next.js API routes.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) with React and TypeScript
- [PocketBase](https://pocketbase.io/) database, accessed with the `pocketbase` JS SDK

## Project structure

```
app/
  layout.tsx        Root layout with the bottom navigation bar
  page.tsx          Home page (introduction to the app)
  globals.css       Global styles
  api/              Backend API routes (route.tsx files)
lib/
  database.tsx      PocketBase connection + authenticate() helper
```

## PocketBase setup

1. Start PocketBase:

   ```bash
   ./pocketbase serve
   ```

2. Open the admin console by adding `/_/` to the database URL
   (e.g. `http://127.0.0.1:8090/_/`).
3. Create a collection called **`products`** with these four **text** fields:

   | Field         | Type |
   |---------------|------|
   | `brand`       | Text |
   | `model`       | Text |
   | `price`       | Text |
   | `description` | Text |

4. Add the ten laptop records (4 Dell, 4 Lenovo, 2 Acer) with **New record**.

## Environment variables

Copy `.env.example` to `.env.local` at the project root and fill in your
PocketBase superuser details:

```
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_SUPERUSER_EMAIL=your-email@example.com
POCKETBASE_SUPERUSER_PASSWORD=your-password
```

## Running the app

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
PocketBase must be running at the same time.
