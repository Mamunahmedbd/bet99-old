import { createClient } from "redis";

export const redisReplica = createClient({
  url: process.env.REDIS_URL_REPLICA || "redis://:123456@localhost:6379",
});
redisReplica.on("error", (err) => console.log("Redis Client Error", err));
redisReplica.on("connect", () => console.log("Redis connected"));
(async () => {
  await redisReplica.connect();
})();
