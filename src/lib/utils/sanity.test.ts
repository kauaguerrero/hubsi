import { describe, expect, it } from "vitest";

describe("setup", () => {
  it("resolve o alias @/", async () => {
    const mod = await import("@/test/server-only");
    expect(mod).toBeDefined();
  });
});
