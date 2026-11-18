# Optimisation

Two optimisation approaches were implemented to improve how the app is
delivered to users (in addition to the Redis text cache on the homepage):

1. **Browser caching of API responses** with HTTP `Cache-Control` headers
2. **Smaller API responses** by only requesting the fields each page needs

Both target the API routes, because every product page gets its data from
them. Fewer and smaller requests mean pages load faster and less data is sent
over the network (important on mobile connections).

---

## 1. Browser caching with `Cache-Control` headers

### The problem

Every time a user opened the products list or a product page, the browser
asked the server again for the same data, even if they had seen it a few
seconds earlier (e.g. *list → product → back to list*). Each request goes
browser → Next.js → PocketBase and back.

### What was implemented

The two GET API routes (`/api/getAll` and `/api/getProduct`) now send a
`Cache-Control` header with their successful responses:

```
Cache-Control: public, max-age=30, stale-while-revalidate=60
```

| Part | Meaning |
|------|---------|
| `public` | The response can be stored by the browser (and by a CDN/proxy if the app is deployed behind one). |
| `max-age=30` | For 30 seconds, the browser reuses its stored copy **without contacting the server at all**. |
| `stale-while-revalidate=60` | For 60 more seconds, the browser can show the stored copy instantly while it fetches a fresh one in the background. |

Code (`lib/product.tsx` and `app/api/getAll/route.tsx`):

```ts
export const API_CACHE_CONTROL = "public, max-age=30, stale-while-revalidate=60";

return NextResponse.json(products, {
  status: 200,
  headers: { "Cache-Control": API_CACHE_CONTROL },
});
```

Error responses (400, 404, 500) do **not** get this header, so errors are
never cached.

### Keeping the data correct after a change (cache busting)

The risk with caching is showing **old data**: after adding, updating or
deleting a product, the cached list would still be the old one for up to
30 seconds.

To avoid this, the pages request the API with a version number in the URL
(`/api/getAll?v=...`). After every add / update / delete, the version is
changed (`markProductsChanged()` in `lib/api.tsx`, stored in
`sessionStorage`). The browser sees a **new URL**, so it cannot use the old
cached copy and gets fresh data from the server. Pages that were not changed
keep using the cache.

```ts
export function markProductsChanged() {
  sessionStorage.setItem("productsVersion", String(Date.now()));
}

const res = await fetch(`/api/getAll?v=${dataVersion()}`);
```

Trade-off: changes made **in another browser tab or by another user** can
take up to 30 seconds to appear. For a product catalogue this is acceptable,
and the time can be shortened by lowering `max-age`.

---

## 2. Smaller API responses (only the fields that are needed)

### The problem

`/api/getAll` returned **every field of every product**, including the long
`description` and PocketBase's internal fields (`collectionId`,
`collectionName`, `created`, `updated`). The products list only displays the
brand, model and price, so most of the data downloaded was never used.

### What was implemented

PocketBase's `fields` option is used so the database only returns the fields
the page actually needs:

```ts
// app/api/getAll/route.tsx — the list only shows brand, model and price
const products = await db.collection("products").getFullList({
  sort: "-created",
  fields: "id,brand,model,price",
});

// app/api/getProduct/route.tsx — the product page also needs the description
const product = await db.collection("products").getOne(id, {
  fields: "id,brand,model,price,description",
});
```

Before / after for one product in `/api/getAll`:

```jsonc
// Before
{"brand":"Acer","collectionId":"pbc_4092854851","collectionName":"products",
 "created":"2026-11-18 17:51:52.485Z",
 "description":"15.6\" gaming laptop, Intel Core i5, 16GB RAM, RTX 4050",
 "id":"sgjvga507740zxy","model":"Nitro V 15","price":"899.00",
 "updated":"2026-11-18 17:51:52.485Z"}

// After
{"id":"sgjvga507740zxy","brand":"Acer","model":"Nitro V 15","price":"899.00"}
```

This also means less work for PocketBase (it serialises less data) and less
data for the browser to parse.

---

## Results

Measured on the production build (`npm run build && npm start`) with the 10
laptops in the database.

### Size of the API responses (response body)

| Route | Before | After | Saving |
|-------|-------:|------:|-------:|
| `/api/getAll` (10 products) | 2,892 bytes | 809 bytes | **−72%** |
| `/api/getProduct` (1 product) | 283 bytes | 149 bytes | **−47%** |

The saving grows with the number of products: with 1,000 products the list
would be about 280 KB before and about 80 KB after.

### A typical visit: list → product → back to list → product again → reload

| | Before | After |
|---|---|---|
| API requests sent to the server | 5 | **2** (3 served from the browser cache) |
| API data downloaded | ~7.9 KB | **~1.6 KB** (−80%) |
| "Back to list" | 207 ms | **54 ms** |
| "Open product again" | 203 ms | **68 ms** |

---

## How to check it yourself (Chrome DevTools)

1. Run the app in production mode: `npm run build` then `npm start`
   (dev mode works too, but production numbers are more realistic).
2. Open DevTools (F12) → **Network** tab → filter **Fetch/XHR**.
   Make sure **"Disable cache" is not ticked**.
3. Open **Products**, click **View** on a product, then **Back to products**.
4. **Caching:** the second `getAll?v=...` request shows **"(disk cache)"** in
   the *Size* column and takes about 0 ms. Click the request → *Headers* to
   see `Cache-Control: public, max-age=30, stale-while-revalidate=60`.
5. **Smaller responses:** click `getAll` → *Response*: only `id`, `brand`,
   `model` and `price` are returned.
6. **Freshness:** add or edit a product, go back to the list: the new data
   appears straight away (the request URL has a new `v=` number).
