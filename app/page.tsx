import type { Metadata } from "next";
import { connection } from "next/server";
import { getHomeText } from "@/lib/homeText";

// Browser tab title + description, also taken from Redis
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { text } = await getHomeText();
  return { title: text.pageTitle, description: text.description };
}

export default async function Home() {
  // Run at request time (not at build time) so the text is read from Redis
  // every time the homepage loads
  await connection();
  const { text, source } = await getHomeText();

  return (
    <section className="page" data-text-source={source}>
      <p className="eyebrow">{text.eyebrow}</p>
      <h1>{text.title}</h1>
      <p className="description">{text.description}</p>

      <div className="card">
        <h2>{text.cardTitle}</h2>
        <p>{text.cardText}</p>
      </div>
    </section>
  );
}
