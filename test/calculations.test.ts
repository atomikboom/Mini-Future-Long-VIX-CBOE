import { describe, expect, it } from "vitest";
import { buildEntries, certFromVix, getAlloc, vixFromCert } from "../lib/calculations";

describe("calculation primitives", () => {
  it("converts cert<->vix consistently", () => {
    const strike = 11.79;
    const fx = 1.09;
    const cert = certFromVix(20, strike, fx);
    expect(vixFromCert(cert, strike, fx)).toBeCloseTo(20, 1);
  });

  it("alloc equal sums to budget", () => {
    const budget = 5000;
    const allocs = getAlloc("equal", 5, budget);
    const total = allocs.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(budget, 6);
  });

  it("buildEntries never returns negative qty", () => {
    const entries = buildEntries({
      budget: 1000,
      firstEntry: 8,
      step: 0.2,
      numEntries: 5,
      alloc: "pyramid",
      commission: 50,
      strike: 11.79,
      fxRate: 1.09,
    });

    expect(entries.every((e) => e.qty >= 0)).toBe(true);
  });
});
