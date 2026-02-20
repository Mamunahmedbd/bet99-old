/**
 * Exchange HTTP Client
 *
 * Production-grade HTTP client for the diamond-proxy API layer.
 * Unlike Diamond's dual-URL racing, Exchange targets a single
 * diamond-proxy base URL.
 *
 * Features:
 * - Configurable timeouts for GET and POST
 * - AbortController-based request cancellation
 * - Structured logging with child logger
 * - Query parameter builder
 * - Zero external dependencies (uses native fetch)
 */
import type { Logger } from "@application/ports/logger";

export interface ExchangeClientConfig {
  /** diamond-proxy base URL */
  baseUrl: string;
  /** x-api-key header value */
  apiKey: string;
  /** GET request timeout in ms (default: 3000) */
  requestTimeout: number;
  /** POST request timeout in ms (default: 5000) */
  postTimeout: number;
}

export class ExchangeHttpClient {
  private readonly config: ExchangeClientConfig;
  private readonly logger: Logger;
  private readonly commonHeaders: Record<string, string>;

  constructor(config: ExchangeClientConfig, logger: Logger) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, ""),
    };

    this.logger = logger.child({ service: "ExchangeHttpClient" });

    this.commonHeaders = {
      accept: "application/json",
      "accept-encoding": "gzip",
      "x-api-key": config.apiKey,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // ── Public API ──
  // ─────────────────────────────────────────────────────────────

  /**
   * GET request with optional query parameters.
   * @param endpoint - API endpoint path (e.g., "/diamond-proxy/sports")
   * @param params - Optional query parameters
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    let url = `${this.config.baseUrl}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, String(value));
      }
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, "GET", this.config.requestTimeout);
  }

  /**
   * POST request with JSON body.
   * @param endpoint - API endpoint path
   * @param body - Request body
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    return this.request<T>(url, "POST", this.config.postTimeout, body);
  }

  /**
   * Health check — attempts a lightweight GET to the base URL.
   * Returns true if reachable within timeout.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.requestTimeout,
      );

      const response = await fetch(
        `${this.config.baseUrl}/diamond-proxy/sports`,
        {
          method: "GET",
          headers: this.commonHeaders,
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── Internal Request Handler ──
  // ─────────────────────────────────────────────────────────────

  private async request<T>(
    url: string,
    method: "GET" | "POST",
    timeout: number,
    payload?: unknown,
  ): Promise<T> {
    const controller = new AbortController();

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.commonHeaders,
        ...(method === "POST"
          ? { "content-type": "application/json" }
          : {}),
      },
      signal: controller.signal,
      ...(method === "POST" && payload
        ? { body: JSON.stringify(payload) }
        : {}),
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timeout after ${timeout}ms: ${url}`));
      }, timeout);
    });

    try {
      const response = (await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise,
      ])) as Response;

      if (!response.ok && response.status >= 500) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} — ${url}`,
        );
      }

      const data = (await response.json()) as T;

      this.logger.debug("Request succeeded", {
        url,
        method,
        status: response.status,
      });

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request aborted (timeout ${timeout}ms): ${url}`);
      }

      this.logger.error("Request failed", {
        url,
        method,
        error: (error as Error).message,
      });

      throw error;
    }
  }
}
