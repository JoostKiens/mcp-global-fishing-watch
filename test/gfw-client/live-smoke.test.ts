import { describe, expect, it } from "vitest";

import { createGfwClient } from "../../src/gfw-client/client.js";

describe("GFW live smoke test", () => {
  it("can authenticate and read a simple GFW v3 endpoint", async () => {
    const client = createGfwClient();
    const result = await client.get<{ entries?: unknown[] }>('/v3/datasets?limit=1&offset=0');

    if (!result.ok) {
      throw new Error(`GFW request failed: ${result.error.message}`);
    }

    expect(result.value).toBeDefined();
  });
});
