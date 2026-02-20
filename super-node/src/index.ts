/**
 * Application Entry Point — Composition Root
 *
 * This is the ONLY file that knows about ALL layers.
 * It loads config → creates DI container → builds the Elysia app → starts listening.
 *
 * Architecture Flow:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Presentation Layer                       │
 * │  (ElysiaJS Routes, Middleware, Error Handlers)              │
 * │                         ↓ depends on                        │
 * │                    Application Layer                        │
 * │  (Use Cases, DTOs, Mappers, Ports/Interfaces)               │
 * │                         ↓ depends on                        │
 * │                      Domain Layer                           │
 * │  (Entities, Value Objects, Repo Interfaces, Domain Services)│
 * │                         ↑ implements                        │
 * │                   Infrastructure Layer                      │
 * │  (Redis, HTTP Clients, Provider Adapters, Repositories)     │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Dependency Rule: Inner layers NEVER depend on outer layers.
 * Infrastructure implements domain interfaces (Dependency Inversion).
 */
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { loadConfig } from "@config/env";
import { createContainer } from "@config/container";
import { errorHandler } from "@presentation/middleware/error-handler";
import { requestLogger } from "@presentation/middleware/request-logger";
import { matchRoutes } from "@presentation/routes/match.routes";
import { healthRoutes } from "@presentation/routes/health.routes";
import { exchangeRoutes } from "@presentation/routes/exchange.routes";

async function bootstrap() {
  // ── 1. Load configuration ──
  const config = loadConfig();

  // ── 2. Create DI container ──
  const container = await createContainer(config);
  const { logger } = container;

  logger.info("Starting Super Node", {
    env: config.env,
    port: config.port,
    redis: config.redis.enabled,
    providers: Array.from(container.providers.keys()),
  });

  // ── 3. Build Elysia application ──
  const app = new Elysia()
    // ── Global Plugins ──
    .use(cors())
    .use(
      swagger({
        documentation: {
          info: {
            title: "Super Node API",
            version: "1.0.50",
            description:
              "Real-time sports data middleware — Domain-Driven Clean Architecture",
          },
          tags: [
            { name: "Matches", description: "Live match operations" },
            { name: "Sync", description: "Data provider sync operations" },
            { name: "Exchange", description: "Exchange data endpoints" },
            { name: "System", description: "Health & system endpoints" },
          ],
        },
      }),
    )

    // ── Middleware ──
    .use(errorHandler(logger))
    .use(requestLogger(logger))

    // ── Routes ──
    .use(matchRoutes(container))
    .use(healthRoutes(container))

    // ── Exchange Routes (conditional) ──
    .use(
      container.exchangeProvider && container.exchangeScheduler
        ? exchangeRoutes({
          provider: container.exchangeProvider,
          scheduler: container.exchangeScheduler,
          cache: container.cache,
          logger: container.logger,
        })
        : new (await import("elysia")).Elysia(),
    )

    // ── Root ──
    .get("/", () => ({
      name: "Super Node",
      version: "1.0.50",
      status: "running",
      docs: "/swagger",
    }))

    // ── Start Server ──
    .listen(config.port);

  logger.info(
    `🦊 Super Node is running at ${app.server?.hostname}:${app.server?.port}`,
  );
  logger.info(`📚 Swagger docs at http://localhost:${config.port}/swagger`);

  // ── Graceful Shutdown ──
  const shutdown = async () => {
    logger.info("Received shutdown signal");
    await container.shutdown();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Fatal: Failed to start Super Node", error);
  process.exit(1);
});
