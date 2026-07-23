import { afterEach, describe, expect, it, vi } from "vitest";

import type { GfwClient, GfwResult } from "../gfw-client/client.js";
import { ReportQueue } from "./report-queue.js";

function createMockClient(): GfwClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
  };
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const http524: GfwResult<never> = {
  ok: false,
  error: { kind: "http-error", status: 524, message: "GFW request timed out." },
};

const notFound: GfwResult<never> = {
  ok: false,
  error: { kind: "http-error", status: 404, message: "GFW could not find the requested resource." },
};

describe("ReportQueue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a cached value without calling GFW", async () => {
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue({ ok: true, value: { total: 1 } });

    const queue = new ReportQueue(client);
    const params = { region: "eez:1" };

    const first = await queue.run(params);
    expect(first).toEqual({ ok: true, value: { total: 1 } });

    const second = await queue.run(params);
    expect(second).toEqual({ ok: true, value: { total: 1 } });
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it("serializes overlapping calls instead of hitting GFW concurrently", async () => {
    const client = createMockClient();
    const order: string[] = [];
    const first = deferred<GfwResult<{ total: number }>>();

    vi.mocked(client.post).mockImplementation(async (_path, body) => {
      const region = (body as { region: string }).region;
      order.push(`start:${region}`);
      if (region === "eez:1") {
        return first.promise;
      }
      order.push(`end:${region}`);
      return { ok: true, value: { total: 2 } };
    });

    const queue = new ReportQueue(client);
    const firstCall = queue.run({ region: "eez:1" });
    const secondCall = queue.run({ region: "eez:2" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(order).toEqual(["start:eez:1"]);

    first.resolve({ ok: true, value: { total: 1 } });
    const [firstResult, secondResult] = await Promise.all([firstCall, secondCall]);

    expect(order).toEqual(["start:eez:1", "start:eez:2", "end:eez:2"]);
    expect(firstResult).toEqual({ ok: true, value: { total: 1 } });
    expect(secondResult).toEqual({ ok: true, value: { total: 2 } });
  });

  it("dedupes identical concurrent requests to a single GFW call after the lock is released", async () => {
    const client = createMockClient();
    const first = deferred<GfwResult<{ total: number }>>();
    vi.mocked(client.post).mockReturnValueOnce(first.promise);

    const queue = new ReportQueue(client);
    const params = { region: "eez:1" };

    const firstCall = queue.run(params);
    const secondCall = queue.run(params);

    await new Promise((resolve) => setTimeout(resolve, 0));
    first.resolve({ ok: true, value: { total: 1 } });

    const [firstResult, secondResult] = await Promise.all([firstCall, secondCall]);
    expect(firstResult).toEqual({ ok: true, value: { total: 1 } });
    expect(secondResult).toEqual({ ok: true, value: { total: 1 } });
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it("times out a caller stuck behind a long in-flight request without ever calling GFW itself", async () => {
    vi.useFakeTimers();
    const client = createMockClient();
    const inFlight = deferred<GfwResult<{ total: number }>>();
    vi.mocked(client.post).mockReturnValueOnce(inFlight.promise);

    const queue = new ReportQueue(client);
    const firstCall = queue.run({ region: "eez:1" });
    const secondCall = queue.run({ region: "eez:2" });

    await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
    const secondResult = await secondCall;

    expect(secondResult).toEqual({
      ok: false,
      error: {
        kind: "queue-timeout",
        message: "GFW report queue is busy; another report is already running. Try again shortly.",
      },
    });
    expect(client.post).toHaveBeenCalledTimes(1);

    inFlight.resolve({ ok: true, value: { total: 1 } });
    await firstCall;
  });

  it("outlasts a holder's full 524-recovery instead of timing out mid-recovery", async () => {
    vi.useFakeTimers();
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValueOnce(http524).mockResolvedValueOnce({ ok: true, value: { total: 9 } });
    vi.mocked(client.get)
      .mockResolvedValueOnce(http524)
      .mockResolvedValueOnce({ ok: true, value: { total: 1 } });

    const queue = new ReportQueue(client);
    const firstCall = queue.run({ region: "eez:1" });
    const secondCall = queue.run({ region: "eez:2" });

    // First caller 524s, then waits out one poll interval before last-report resolves.
    await vi.advanceTimersByTimeAsync(5000);
    const [firstResult, secondResult] = await Promise.all([firstCall, secondCall]);

    expect(firstResult).toEqual({ ok: true, value: { total: 1 } });
    expect(secondResult).toEqual({ ok: true, value: { total: 9 } });
    expect(client.post).toHaveBeenCalledTimes(2);
  });

  it("polls last-report on a 524 and resolves once it returns data", async () => {
    vi.useFakeTimers();
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue(http524);
    vi.mocked(client.get)
      .mockResolvedValueOnce(http524)
      .mockResolvedValueOnce({ ok: true, value: { total: 5 } });

    const queue = new ReportQueue(client);
    const call = queue.run({ region: "eez:1" });

    await vi.advanceTimersByTimeAsync(2 * 5000);
    const result = await call;

    expect(result).toEqual({ ok: true, value: { total: 5 } });
    expect(client.get).toHaveBeenCalledWith("/v3/4wings/last-report");
    expect(client.get).toHaveBeenCalledTimes(2);
  });

  it("gives up with a poll-timeout once the 30-minute last-report window elapses", async () => {
    vi.useFakeTimers();
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue(http524);
    vi.mocked(client.get).mockResolvedValue(http524);

    const queue = new ReportQueue(client);
    const call = queue.run({ region: "eez:1" });

    await vi.advanceTimersByTimeAsync(30 * 60 * 1000);
    const result = await call;

    expect(result).toEqual({
      ok: false,
      error: {
        kind: "poll-timeout",
        message: "GFW report did not complete within the 30-minute last-report window.",
      },
    });
  });

  it("stops polling immediately on a non-524 error from last-report", async () => {
    vi.useFakeTimers();
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue(http524);
    vi.mocked(client.get).mockResolvedValueOnce(notFound);

    const queue = new ReportQueue(client);
    const call = queue.run({ region: "eez:1" });

    await vi.advanceTimersByTimeAsync(5000);
    const result = await call;

    expect(result).toEqual({ ok: false, error: { kind: "gfw-error", error: notFound.error } });
    expect(client.get).toHaveBeenCalledTimes(1);
  });

  it("returns a gfw-error without polling on a non-524 error from the initial report call", async () => {
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue(notFound);

    const queue = new ReportQueue(client);
    const result = await queue.run({ region: "eez:1" });

    expect(result).toEqual({ ok: false, error: { kind: "gfw-error", error: notFound.error } });
    expect(client.get).not.toHaveBeenCalled();
  });
});
