/**
 * Infrastructure — HTTP Client
 * Lightweight wrapper around fetch with retries, timeouts, and logging.
 */
import type { Logger } from "@application/ports/logger";

export interface HttpClientOptions {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly headers: Record<string, string>;
  private readonly logger: Logger;

  constructor(options: HttpClientOptions, logger: Logger) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeout = options.timeout ?? 10_000;
    this.retries = options.retries ?? 3;
    this.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    this.logger = logger.child({ service: "HttpClient", baseUrl: this.baseUrl });
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>("GET", url);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>("POST", url, body);
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.timeout,
        );

        const response = await fetch(url, {
          method,
          headers: this.headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Request failed (attempt ${attempt}/${this.retries})`,
          {
            method,
            url,
            error: lastError.message,
          },
        );

        if (attempt < this.retries) {
          await new Promise((r) =>
            setTimeout(r, Math.pow(2, attempt) * 100),
          );
        }
      }
    }

    throw lastError ?? new Error("Request failed after all retries");
  }
}
