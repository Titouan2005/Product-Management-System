// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Product Management System",
  description: "Manage laptop products stored in PocketBase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <main className="content">{children}</main>

        <nav className="bottomNav">
          <Link href="/">
            <span>⌂</span>
            Home
          </Link>

          <Link href="/listAllProducts">
            <span>☰</span>
            Laptops
          </Link>

          <Link href="/addProduct">
            <span>＋</span>
            Add laptop
          </Link>
        </nav>
      </body>
    </html>
  );
}
