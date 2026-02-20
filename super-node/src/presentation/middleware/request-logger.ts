/**
 * Presentation — Request Logger Middleware
 * Logs all incoming requests with timing information.
 */
import { Elysia } from "elysia";
import type { Logger } from "@application/ports/logger";

export function requestLogger(logger: Logger) {
  return new Elysia({ name: "request-logger" })
    .derive(({ request }) => {
      return {
        requestStartTime: performance.now(),
        requestId: crypto.randomUUID(),
        requestPath: new URL(request.url).pathname,
      };
    })
    .onAfterResponse(
      ({ request, requestStartTime, requestId, requestPath, set }) => {
        const duration = (performance.now() - requestStartTime).toFixed(2);
        logger.info("Request completed", {
          requestId,
          method: request.method,
          path: requestPath,
          status: set.status ?? 200,
          duration: `${duration}ms`,
        });
      },
    );
}
