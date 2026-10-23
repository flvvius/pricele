import { describe, expect, it } from "vitest";
import { parsePrice, sanitizePrice } from "./priceinput";

describe("parsePrice", () => {
  it("reads a comma as a decimal point", () => {
    expect(parsePrice("1,6")).toBe(1.6);
    expect(parsePrice("4,99")).toBe(4.99);
    expect(parsePrice(",5")).toBe(0.5);
    expect(parsePrice("2,")).toBe(2);
    expect(parsePrice("0,500")).toBe(0.5);
  });

  it("reads a dot as a decimal point", () => {
    expect(parsePrice("1.6")).toBe(1.6);
    expect(parsePrice("$3.50")).toBe(3.5);
  });

  it("still reads thousands separators", () => {
    expect(parsePrice("1,600")).toBe(1600);
    expect(parsePrice("12,500,000")).toBe(12_500_000);
    expect(parsePrice("1.234.567")).toBe(1_234_567);
  });

  it("takes the last mark as the decimal point when both appear", () => {
    expect(parsePrice("1,234.56")).toBe(1234.56);
    expect(parsePrice("1.234,56")).toBe(1234.56);
  });

  it("rejects what isn't a price", () => {
    expect(parsePrice("")).toBeNaN();
    expect(parsePrice(",")).toBeNaN();
    expect(parsePrice("1,2,3")).toBeNaN();
    expect(parsePrice("1.2.3")).toBeNaN();
  });
});

describe("sanitizePrice", () => {
  it("keeps the comma a player typed", () => {
    expect(sanitizePrice("$ 1,6")).toBe("1,6");
  });
});
