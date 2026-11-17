// app/page.tsx
export default function Home() {
  return (
    <section className="page">
      <p className="eyebrow">PRODUCT MANAGEMENT SYSTEM</p>
      <h1>Home</h1>
      <p className="description">
        Welcome! This app lets you add, view, update and delete products
        stored in a PocketBase database.
      </p>

      <div className="card">
        <h2>Welcome!</h2>
        <p>
          Use the Products button in the navigation bar at the bottom of the
          screen to see all products. From there you can add a new product,
          view a product&apos;s details, update it or delete it.
        </p>
      </div>
    </section>
  );
}
