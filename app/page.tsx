// app/page.tsx
export default function Home() {
  return (
    <section className="page">
      <p className="eyebrow">PRODUCT MANAGEMENT SYSTEM</p>
      <h1>Home</h1>
      <p className="description">
        Welcome! This app lets you manage a catalogue of laptops stored in a
        PocketBase database.
      </p>

      <div className="card">
        <h2>Welcome!</h2>
        <p>
          Use the navigation bar at the bottom of the screen to view all
          laptops or to add a new one.
        </p>
      </div>
    </section>
  );
}
