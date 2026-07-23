import type { GfwClient, GfwError } from "../gfw-client/client.js";
import { Cache } from "./cache.js";
import { normalizeKey } from "./normalize-key.js";

const REPORT_ENDPOINT = "/v3/4wings/report";
const LAST_REPORT_ENDPOINT = "/v3/4wings/last-report";

const REPORT_CACHE_TTL_MS = 15 * 60 * 1000;
const QUEUE_WAIT_TIMEOUT_MS = 2 * 60 * 1000;
const LAST_REPORT_POLL_INTERVAL_MS = 5000;
const LAST_REPORT_WINDOW_MS = 30 * 60 * 1000;

export type ReportQueueError =
  | { readonly kind: "queue-timeout"; readonly message: string }
  | { readonly kind: "poll-timeout"; readonly message: string }
  | { readonly kind: "gfw-error"; readonly error: GfwError };

export type ReportQueueResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ReportQueueError };

interface Waiter {
  readonly wake: () => void;
}

/**
 * Single-concurrency lock + 15-min cache + 524/last-report recovery for GFW's
 * `4wings/report` endpoint. Do not call `4wings/report` except through this queue
 * (see docs/claude/architecture.md) — construct one instance and share it across
 * every tool that hits the endpoint, since GFW's concurrency limit is per token,
 * not per tool.
 */
export class ReportQueue {
  private readonly client: GfwClient;
  private readonly cache = new Cache<string, unknown>({ ttlMs: REPORT_CACHE_TTL_MS });
  private busy = false;
  private readonly waiters: Waiter[] = [];

  constructor(client: GfwClient) {
    this.client = client;
  }

  async run<T>(params: Record<string, unknown>): Promise<ReportQueueResult<T>> {
    const cacheKey = normalizeKey(params);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return { ok: true, value: cached as T };
    }

    const acquired = await this.acquireLock();
    if (!acquired) {
      return {
        ok: false,
        error: {
          kind: "queue-timeout",
          message: "GFW report queue is busy; another report is already running. Try again shortly.",
        },
      };
    }

    try {
      const cachedAfterWait = this.cache.get(cacheKey);
      if (cachedAfterWait !== undefined) {
        return { ok: true, value: cachedAfterWait as T };
      }
      return await this.execute<T>(cacheKey, params);
    } finally {
      this.releaseLock();
    }
  }

  private async execute<T>(cacheKey: string, params: Record<string, unknown>): Promise<ReportQueueResult<T>> {
    const result = await this.client.post<T>(REPORT_ENDPOINT, params);
    if (result.ok) {
      this.cache.set(cacheKey, result.value);
      return { ok: true, value: result.value };
    }
    if (isGfwTimeout(result.error)) {
      return this.pollLastReport<T>(cacheKey);
    }
    return { ok: false, error: { kind: "gfw-error", error: result.error } };
  }

  private async pollLastReport<T>(cacheKey: string): Promise<ReportQueueResult<T>> {
    const deadline = Date.now() + LAST_REPORT_WINDOW_MS;
    while (Date.now() < deadline) {
      await sleep(LAST_REPORT_POLL_INTERVAL_MS);
      const result = await this.client.get<T>(LAST_REPORT_ENDPOINT);
      if (result.ok) {
        this.cache.set(cacheKey, result.value);
        return { ok: true, value: result.value };
      }
      if (!isGfwTimeout(result.error)) {
        return { ok: false, error: { kind: "gfw-error", error: result.error } };
      }
    }
    return {
      ok: false,
      error: {
        kind: "poll-timeout",
        message: "GFW report did not complete within the 30-minute last-report window.",
      },
    };
  }

  // A `busy` flag plus a FIFO array of waiters, not a chained-promise mutex: a
  // waiter that gives up on timeout must be removed without waking the waiter
  // behind it, since the actual holder may still be running. A simple `.then()`
  // chain can't express that without falsely handing off ownership early.
  private acquireLock(): Promise<boolean> {
    if (!this.busy) {
      this.busy = true;
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      let settled = false;
      const waiter: Waiter = {
        wake: () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(true);
        },
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        const index = this.waiters.indexOf(waiter);
        if (index !== -1) this.waiters.splice(index, 1);
        resolve(false);
      }, QUEUE_WAIT_TIMEOUT_MS);
      this.waiters.push(waiter);
    });
  }

  private releaseLock(): void {
    const next = this.waiters.shift();
    if (next) {
      next.wake();
    } else {
      this.busy = false;
    }
  }
}

function isGfwTimeout(error: GfwError): boolean {
  return error.kind === "http-error" && error.status === 524;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
