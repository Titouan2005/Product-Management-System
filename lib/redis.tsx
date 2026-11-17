// lib/redis.tsx
// Connection to the Redis cache (Redis Cloud). Server-side only: the
// password in .env.local must never be sent to the browser.
import "server-only";
import { createClient } from "redis";

function createRedisClient() {
  return createClient({
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
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
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    throw new Error("REDIS_HOST / REDIS_PORT are not set in .env.local");
  }

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
