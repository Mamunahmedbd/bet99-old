/**
 * Diamond HTTP Client
 *
 * Production-grade HTTP client for Diamond Sports API featuring:
 * - Dual-URL "first response wins" pattern (both URLs called simultaneously)
 * - Configurable timeouts for GET and POST
 * - Structured logging with child loggers
 * - AbortController-based request cancellation
 * - Graceful error aggregation when both URLs fail
 * - Zero external dependencies (uses native fetch)
 */
import type { Logger } from "@application/ports/logger";

export interface DiamondClientConfig {
  /** Primary API base URL */
  baseUrl: string;
  /** Secondary/fallback API base URL */
  secondaryUrl: string;
  /** API authentication key */
  apiKey: string;
  /** GET request timeout in ms (default: 2000) */
  requestTimeout: number;
  /** POST request timeout in ms (default: 4000) */
  postTimeout: number;
}

/**
 * Low-level HTTP client that implements Diamond's dual-URL racing pattern.
 * Both primary and secondary URLs are called simultaneously — first successful
 * response wins, and the losing request is aborted.
 */
export class DiamondHttpClient {
  private readonly config: DiamondClientConfig;
  private readonly logger: Logger;
  private readonly commonHeaders: Record<string, string>;

  constructor(config: DiamondClientConfig, logger: Logger) {
    // Normalize URLs — strip trailing slashes
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, ""),
      secondaryUrl: config.secondaryUrl.replace(/\/+$/, ""),
    };

    this.logger = logger.child({ service: "DiamondHttpClient" });

    this.commonHeaders = {
      "x-turnkeyxgaming-key": this.config.apiKey,
      accept: "application/json",
      "accept-encoding": "gzip",
    };
  }

  // ─────────────────────────────────────────────────────────────
  // ── Public API ──
  // ─────────────────────────────────────────────────────────────

  /**
   * GET request using dual-URL race pattern.
   * @param endpoint - API endpoint path (e.g., "/sports/allSportid")
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.race<T>(endpoint, "GET");
  }

  /**
   * POST request using dual-URL race pattern.
   * @param endpoint - API endpoint path
   * @param payload - Request body
   */
  async post<T>(endpoint: string, payload: unknown): Promise<T> {
    return this.race<T>(endpoint, "POST", payload);
  }

  /**
   * Health check — attempts a lightweight GET to the primary URL.
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
        `${this.config.baseUrl}/sports/allSportid`,
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
  // ── Dual-URL Race Pattern ──
  // ─────────────────────────────────────────────────────────────

  /**
   * Core racing logic — fires requests to both URLs simultaneously.
   * First successful response wins; the other is aborted.
   */
  private race<T>(
    endpoint: string,
    method: "GET" | "POST",
    payload?: unknown,
  ): Promise<T> {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const timeout =
      method === "POST"
        ? this.config.postTimeout
        : this.config.requestTimeout;

    return new Promise<T>((resolve, reject) => {
      let settled = false;
      let errorCount = 0;
      let firstError: Error | undefined;

      const onSuccess = (data: T, source: string) => {
        if (settled) return;
        settled = true;

        // Abort the losing request
        controller1.abort();
        controller2.abort();

        this.logger.debug("Request succeeded", {
          endpoint,
          source,
          method,
        });

        resolve(data);
      };

      const onFailure = (error: Error, source: string) => {
        if (!firstError) firstError = error;
        errorCount++;

        // Only reject when BOTH have failed
        if (errorCount >= 2 && !settled) {
          settled = true;
          this.logger.error("Both URLs failed", {
            endpoint,
            method,
            error: firstError.message,
          });
          reject(firstError);
        } else {
          this.logger.debug("URL failed, waiting for other", {
            endpoint,
            source,
            error: error.message,
          });
        }
      };

      // Fire both requests simultaneously
      this.makeSingleRequest<T>(
        this.config.baseUrl,
        endpoint,
        method,
        timeout,
        controller1.signal,
        payload,
      )
        .then((data) => onSuccess(data, "primary"))
        .catch((err) => onFailure(err, "primary"));

      this.makeSingleRequest<T>(
        this.config.secondaryUrl,
        endpoint,
        method,
        timeout,
        controller2.signal,
        payload,
      )
        .then((data) => onSuccess(data, "secondary"))
        .catch((err) => onFailure(err, "secondary"));
    });
  }

  /**
   * Execute a single HTTP request to one base URL.
   */
  private async makeSingleRequest<T>(
    baseUrl: string,
    endpoint: string,
    method: "GET" | "POST",
    timeout: number,
    signal: AbortSignal,
    payload?: unknown,
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    const timeoutId = setTimeout(() => {
      // AbortController is passed externally, but we also need a timeout abort
      // We create a wrapper that will cause the fetch to fail on timeout
    }, timeout);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.commonHeaders,
        ...(method === "POST"
          ? { "content-type": "application/json" }
          : {}),
      },
      signal,
      ...(method === "POST" && payload
        ? { body: JSON.stringify(payload) }
        : {}),
    };

    // Create a timeout race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms: ${url}`));
      }, timeout);
    });

    try {
      const response = (await Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise,
      ])) as Response;

      clearTimeout(timeoutId);

      if (!response.ok && response.status >= 500) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} — ${url}`,
        );
      }

      // Diamond API sometimes returns meaningful data on 4xx
      // (e.g., "no market found" on 404)
      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Don't log abort errors (expected when the other URL wins)
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw error;
      }

      throw error;
    }
  }
}
