# Product Management System

A product management web application built with **Next.js** and **PocketBase**.
As a proof of concept it manages ten laptop models (4 Dell, 4 Lenovo, 2 Acer):
users can add, view, update and delete laptops through a web interface, and all
data is stored in PocketBase and accessed through Next.js API routes.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) with React and TypeScript
- [PocketBase](https://pocketbase.io/) database, accessed with the `pocketbase` JS SDK

## Pages

| Page | URL | What it does |
|------|-----|--------------|
| Home | `/` | Introduction to the application |
| Products list | `/listAllProducts` | All products in the database, with View / Edit / Delete buttons and an **Add product** button |
| Add product | `/addProduct` | Form to add a new product |
| Single product | `/product/<id>` | All information about one product |
| Update product | `/updateProduct/<id>` | Form pre-filled with the product, to update it |

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/getAll` | All products (newest first) |
| GET | `/api/getProduct?id=<id>` | One product (404 if not found) |
| POST | `/api/addProduct` | Create a product (JSON body: brand, model, price, description) |
| PUT | `/api/updateProduct?id=<id>` | Update a product (same JSON body) |
| DELETE | `/api/deleteProduct?id=<id>` | Delete a product |

Invalid data (empty fields, price that is not a positive number with up to
2 decimals, text too long) is rejected with status 400 and a message per field.

## Project structure

```
app/
  layout.tsx              Root layout with the bottom navigation bar
  page.tsx                Home page
  listAllProducts/        Products list page
  addProduct/             Add product page
  product/[id]/           Single product page
  updateProduct/[id]/     Update product page
  api/                    API routes (route.tsx files)
  globals.css             Global + responsive styles
components/
  ProductForm.tsx         Form shared by the add and update pages
lib/
  database.tsx            PocketBase connection + authenticate() helper
  product.tsx             Product type + validation (shared by pages and API)
  api.tsx                 Helpers the pages use to read products from the API
pb_migrations/            Creates the "products" collection automatically
setup-pocketbase.sh       Downloads PocketBase and creates the superuser
```

## PocketBase setup

1. Copy `.env.example` to `.env.local` and fill in the superuser email and
   password you want to use (see below).
2. Download PocketBase and create the superuser:

   ```bash
   npm run pocketbase:setup
   ```

   On Windows, download `pocketbase_0.40.6_windows_amd64.zip` from the
   [PocketBase releases](https://github.com/pocketbase/pocketbase/releases),
   unzip `pocketbase.exe` into the project root and create the superuser in
   the admin console the first time you open it.
3. Start PocketBase (keep it running in its own terminal):

   ```bash
   ./pocketbase serve
   ```

   On first start, the migration in `pb_migrations/` creates the
   **`products`** collection with these four **text** fields:

   | Field         | Type |
   |---------------|------|
   | `brand`       | Text |
   | `model`       | Text |
   | `price`       | Text |
   | `description` | Text |

4. Open the admin console at `http://127.0.0.1:8090/_/`, log in with the
   superuser, open **products** and add the ten laptop records
   (4 Dell, 4 Lenovo, 2 Acer) with **New record**.

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
