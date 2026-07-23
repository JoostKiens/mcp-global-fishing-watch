import { describe, expect, it } from "vitest";
import { normalizeKey } from "./normalize-key.js";

describe("normalizeKey", () => {
  it("produces identical output for differently-ordered top-level keys", () => {
    expect(normalizeKey({ a: 1, b: 2 })).toBe(normalizeKey({ b: 2, a: 1 }));
  });

  it("produces identical output for differently-ordered nested object keys", () => {
    const first = { region: { id: "eez-1", dataset: "public" }, datasets: ["x"] };
    const second = { region: { dataset: "public", id: "eez-1" }, datasets: ["x"] };
    expect(normalizeKey(first)).toBe(normalizeKey(second));
  });

  it("preserves array order, which changes the key", () => {
    expect(normalizeKey({ ids: [1, 2] })).not.toBe(normalizeKey({ ids: [2, 1] }));
  });

  it("produces different keys for semantically different params", () => {
    expect(normalizeKey({ a: 1 })).not.toBe(normalizeKey({ a: 2 }));
  });

  it("handles empty and primitive-only params deterministically", () => {
    expect(normalizeKey({})).toBe(normalizeKey({}));
    expect(normalizeKey({ a: "x" })).toBe(normalizeKey({ a: "x" }));
  });
});
