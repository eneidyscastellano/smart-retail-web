import { describe, it, expect } from "vitest";

// Testeamos la lógica de parsing de Markdown directamente
// Extraemos las funciones puras del componente para testeo

function parseCells(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0 && !cell.match(/^[\-:]+$/));
}

function isTableStart(line: string, nextLine: string | undefined): boolean {
  return (
    line.trim().startsWith("|") &&
    nextLine !== undefined &&
    Boolean(nextLine.trim().match(/^\|[\s\-:|]+\|/))
  );
}

describe("Markdown parser - parseCells", () => {
  it("extrae celdas de una fila de tabla", () => {
    const cells = parseCells("| Producto | Stock | Estado |");
    expect(cells).toEqual(["Producto", "Stock", "Estado"]);
  });

  it("maneja celdas con espacios extra", () => {
    const cells = parseCells("|  Nombre largo  |  42  |");
    expect(cells).toEqual(["Nombre largo", "42"]);
  });

  it("filtra separadores de tabla", () => {
    const cells = parseCells("|---|---|---|");
    expect(cells).toEqual([]);
  });

  it("maneja filas con contenido mixto", () => {
    const cells = parseCells("| **Abrigo** | 0 | **AGOTADO** 🚨 |");
    expect(cells).toEqual(["**Abrigo**", "0", "**AGOTADO** 🚨"]);
  });
});

describe("Markdown parser - isTableStart", () => {
  it("detecta inicio de tabla válido", () => {
    expect(isTableStart("| A | B |", "|---|---|")).toBe(true);
  });

  it("no detecta tabla sin separador en la siguiente línea", () => {
    expect(isTableStart("| A | B |", "| data | data |")).toBe(false);
  });

  it("no detecta tabla si primera línea no empieza con |", () => {
    expect(isTableStart("No table here", "|---|---|")).toBe(false);
  });

  it("no detecta tabla si no hay siguiente línea", () => {
    expect(isTableStart("| A | B |", undefined)).toBe(false);
  });

  it("detecta separadores con alineación", () => {
    expect(isTableStart("| Col1 | Col2 |", "|:---|---:|")).toBe(true);
  });
});
