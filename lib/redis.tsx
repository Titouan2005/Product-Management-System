// lib/redis.tsx
// Connection to the Redis cache (Redis Cloud). Server-side only: the
// password in .env.local must never be sent to the browser.
import "server-only";
import { createClient } from "redis";

// Reads the Redis settings from .env.local and checks they are usable
function readRedisConfig() {
  // Accept "host", "host:port" or "redis://host:port" in REDIS_HOST
  const rawHost = (process.env.REDIS_HOST ?? "").trim().replace(/^rediss?:\/\//, "");
  const [host, portInHost] = rawHost.split(":");
  const port = Number((process.env.REDIS_PORT ?? "").trim() || portInHost);
  const username = (process.env.REDIS_USERNAME ?? "").trim() || "default";
  const password = (process.env.REDIS_PASSWORD ?? "").trim();

  if (!host) throw new Error("REDIS_HOST is missing in .env.local");
  if (!port) throw new Error("REDIS_PORT is missing or not a number in .env.local");
  if (!password) {
    throw new Error(
      "REDIS_PASSWORD is missing in .env.local (Redis Cloud needs the password of the 'default' user)"
    );
  }
  return { host, port, username, password };
}

function createRedisClient() {
  const { host, port, username, password } = readRedisConfig();

  return createClient({
    username,
    password,
    socket: {
      host,
      port,
      connectTimeout: 5000,
      // Give up after 3 failed attempts so a page never waits forever
      reconnectStrategy: (retries) =>
        retries >= 3 ? new Error("Could not connect to Redis") : 500,
    },
    // Fail straight away instead of queueing commands while disconnected
    disableOfflineQueue: true,
  });
}

type RedisClient = ReturnType<typeof createRedisClient>;

// Keep one connection for the whole app (also across hot reloads in dev)
const globalForRedis = globalThis as unknown as {
  redisClient?: Promise<RedisClient>;
};

function connectRedis(): Promise<RedisClient> {
  const client = createRedisClient();
  client.on("error", (error) => console.error("Redis error:", error.message));

  return client.connect();
}

// Returns a connected Redis client (connects the first time it is called)
export async function getRedis(): Promise<RedisClient> {
  if (globalForRedis.redisClient) {
    const client = await globalForRedis.redisClient.catch(() => null);
    if (client?.isReady) return client;

    // The old connection failed or was lost: close it and connect again
    if (client?.isOpen) client.destroy();
    globalForRedis.redisClient = undefined;
  }

  globalForRedis.redisClient = connectRedis();
  return globalForRedis.redisClient;
}
