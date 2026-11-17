// lib/homeText.tsx
// All the text shown on the homepage. It is stored in the Redis cache
// (as a hash under the key "homepage:text") and read from there each
// time the homepage loads.
import "server-only";
import { cache } from "react";
import { getRedis } from "@/lib/redis";

export type HomeText = {
  pageTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  cardTitle: string;
  cardText: string;
};

export type HomeTextSource = "redis" | "redis-miss" | "fallback";

export const HOME_TEXT_KEY = "homepage:text";

// The text that is put into Redis when it is not there yet
export const defaultHomeText: HomeText = {
  pageTitle: "Home | Product Management System",
  eyebrow: "PRODUCT MANAGEMENT SYSTEM",
  title: "Home",
  description:
    "Welcome! This app lets you add, view, update and delete products stored in a PocketBase database.",
  cardTitle: "Welcome!",
  cardText:
    "Use the Products button in the navigation bar at the bottom of the screen to see all products. From there you can add a new product, view a product's details, update it or delete it.",
};

const FIELDS = Object.keys(defaultHomeText) as (keyof HomeText)[];

function isComplete(data: Record<string, string>): data is HomeText {
  return FIELDS.every((field) => typeof data[field] === "string" && data[field] !== "");
}

// Reads the homepage text from Redis.
// - Found in Redis           -> source "redis"
// - Not in Redis (cache miss) -> stores the default text in Redis, source "redis-miss"
// - Redis not reachable       -> uses the default text, source "fallback"
// cache() makes sure Redis is only called once per page load, even though
// both the page and its metadata (browser tab title) need the text.
export const getHomeText = cache(
  async (): Promise<{ text: HomeText; source: HomeTextSource }> => {
    try {
      const redis = await getRedis();
      const cached = await redis.hGetAll(HOME_TEXT_KEY);

      if (isComplete(cached)) {
        console.log("Homepage text: served from Redis cache");
        return { text: cached, source: "redis" };
      }

      console.log("Homepage text: cache miss, storing it in Redis");
      await redis.hSet(HOME_TEXT_KEY, defaultHomeText);
      return { text: defaultHomeText, source: "redis-miss" };
    } catch (error) {
      console.error("Homepage text: Redis unavailable, using default text:", error);
      return { text: defaultHomeText, source: "fallback" };
    }
  }
);
