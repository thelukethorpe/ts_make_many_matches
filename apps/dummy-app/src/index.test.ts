import { describe, expect, it } from "vitest";
import { runApp } from "./index.js";

describe("runApp", () => {
  it("returns a greeting from the dummy package", () => {
    expect(runApp("TypeScript")).toBe("Hello, TypeScript!");
  });
});
