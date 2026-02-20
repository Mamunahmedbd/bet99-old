/**
 * Presentation — Error Handler Middleware
 * Maps AppError to HTTP responses.
 * This is the only place exceptions become HTTP status codes.
 */
import { Elysia } from "elysia";
import type { Logger } from "@application/ports/logger";

export function errorHandler(logger: Logger) {
  return new Elysia({ name: "error-handler" }).onError(
    ({ code, error, set }) => {
      // ── Elysia built-in errors ──
      if (code === "VALIDATION") {
        set.status = 400;
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details: error.message,
          },
        };
      }

      if (code === "NOT_FOUND") {
        set.status = 404;
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Resource not found",
          },
        };
      }

      // ── Unhandled errors ──
      const errMessage =
        error instanceof Error ? error.message : String(error);
      const errStack =
        error instanceof Error ? error.stack : undefined;

      logger.error("Unhandled error", {
        code,
        message: errMessage,
        stack: errStack,
      });

      set.status = 500;
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : errMessage,
        },
      };
    },
  );
}
