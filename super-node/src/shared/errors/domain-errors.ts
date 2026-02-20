import type { AppError } from "@shared/types/result";

// ──────────────────────────────────────────────
// Domain Error Factories
// ──────────────────────────────────────────────

export const DomainErrors = {
  // ── Entity Not Found ──
  notFound(entity: string, id?: string): AppError {
    return {
      code: "ENTITY_NOT_FOUND",
      message: `${entity}${id ? ` with id '${id}'` : ""} was not found`,
      statusCode: 404,
      details: { entity, id },
    };
  },

  // ── Validation ──
  validation(message: string, details?: Record<string, unknown>): AppError {
    return {
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      details,
    };
  },

  // ── Conflict / Duplicate ──
  conflict(message: string): AppError {
    return {
      code: "CONFLICT",
      message,
      statusCode: 409,
    };
  },

  // ── Unauthorized ──
  unauthorized(message = "Unauthorized"): AppError {
    return {
      code: "UNAUTHORIZED",
      message,
      statusCode: 401,
    };
  },

  // ── Forbidden ──
  forbidden(message = "Forbidden"): AppError {
    return {
      code: "FORBIDDEN",
      message,
      statusCode: 403,
    };
  },

  // ── External Service Failure ──
  externalService(
    service: string,
    message: string,
    cause?: unknown,
  ): AppError {
    return {
      code: "EXTERNAL_SERVICE_ERROR",
      message: `[${service}] ${message}`,
      statusCode: 502,
      details: { service },
      cause,
    };
  },

  // ── Internal / Unexpected ──
  internal(message: string, cause?: unknown): AppError {
    return {
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
      cause,
    };
  },

  // ── Rate Limit ──
  rateLimited(message = "Too many requests"): AppError {
    return {
      code: "RATE_LIMITED",
      message,
      statusCode: 429,
    };
  },

  // ── Timeout ──
  timeout(operation: string): AppError {
    return {
      code: "TIMEOUT",
      message: `Operation timed out: ${operation}`,
      statusCode: 504,
    };
  },
} as const;
