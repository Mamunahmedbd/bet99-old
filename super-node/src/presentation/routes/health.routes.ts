/**
 * Presentation — Health Routes
 * System health and readiness checks.
 */
import { Elysia } from "elysia";
import type { AppContainer } from "@config/container";

export function healthRoutes(container: AppContainer) {
  return new Elysia({ prefix: "/api" })
    // ── GET /api/health ──
    .get("/health", () => ({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.50",
    }), {
      detail: {
        summary: "Health Check",
        description: "Basic health check endpoint.",
        tags: ["System"],
      },
    })
    // ── GET /api/ready ──
    .get("/ready", async () => {
      const providerStatuses: Record<string, boolean> = {};

      for (const [name, provider] of container.providers) {
        providerStatuses[name] = await provider.healthCheck();
      }

      const cacheHealthy = await container.cache
        .set("health:ping", "pong", 5)
        .then(() => true)
        .catch(() => false);

      const allHealthy =
        cacheHealthy &&
        Object.values(providerStatuses).every(Boolean);

      return {
        status: allHealthy ? "ready" : "degraded",
        checks: {
          cache: cacheHealthy,
          providers: providerStatuses,
        },
        timestamp: new Date().toISOString(),
      };
    }, {
      detail: {
        summary: "Readiness Check",
        description: "Deep health check verifying all dependencies.",
        tags: ["System"],
      },
    });
}
