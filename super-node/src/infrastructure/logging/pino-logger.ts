/**
 * Infrastructure — Pino Logger Adapter
 * Implements the Logger port using Pino.
 */
import pino from "pino";
import type { Logger } from "@application/ports/logger";

export function createPinoLogger(name = "super-node"): Logger {
  const pinoLogger = pino({
    name,
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    serializers: pino.stdSerializers,
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return wrapPinoLogger(pinoLogger);
}

function wrapPinoLogger(pinoLogger: pino.Logger): Logger {
  return {
    info(message: string, context?: Record<string, unknown>) {
      pinoLogger.info(context ?? {}, message);
    },
    warn(message: string, context?: Record<string, unknown>) {
      pinoLogger.warn(context ?? {}, message);
    },
    error(message: string, context?: Record<string, unknown>) {
      pinoLogger.error(context ?? {}, message);
    },
    debug(message: string, context?: Record<string, unknown>) {
      pinoLogger.debug(context ?? {}, message);
    },
    child(bindings: Record<string, unknown>): Logger {
      return wrapPinoLogger(pinoLogger.child(bindings));
    },
  };
}
