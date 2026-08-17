import { describe, it, expect } from "vitest";
import { formatCOP } from "@/lib/utils";

describe("formatCOP", () => {
  it("formatea números enteros con separador de miles", () => {
    const result = formatCOP(189900);
    // Debe contener el número formateado (puede variar el símbolo según locale del runtime)
    expect(result).toContain("189");
    expect(result).toContain("900");
  });

  it("formatea 0 correctamente", () => {
    const result = formatCOP(0);
    expect(result).toContain("0");
  });

  it("acepta strings numéricos", () => {
    const result = formatCOP("25000");
    expect(result).toContain("25");
    expect(result).toContain("000");
  });

  it("no muestra decimales", () => {
    const result = formatCOP(189900.75);
    // COP sin decimales
    expect(result).not.toContain(".75");
  });

  it("formatea valores grandes (millones)", () => {
    const result = formatCOP(1500000);
    expect(result).toContain("1");
    expect(result).toContain("500");
    expect(result).toContain("000");
  });
});
