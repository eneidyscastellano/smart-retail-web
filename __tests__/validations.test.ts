import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  partialUpdateProductSchema,
  uuidSchema,
  formatZodError,
} from "@/lib/validations";

// ═══════════════════════════════════════════════════════
// createProductSchema
// ═══════════════════════════════════════════════════════
describe("createProductSchema", () => {
  const validProduct = {
    sku: "INV-001",
    name: "Abrigo de Lana",
    price: 189900,
    cost: 85000,
    current_stock: 10,
    category_id: "c0000001-0000-0000-0000-000000000001",
    supplier_id: "d0000001-0000-0000-0000-000000000001",
  };

  it("acepta un producto válido", () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rechaza SKU vacío", () => {
    const result = createProductSchema.safeParse({ ...validProduct, sku: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodError(result.error)).toContain("SKU");
    }
  });

  it("rechaza nombre vacío", () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza precio negativo", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rechaza costo negativo", () => {
    const result = createProductSchema.safeParse({ ...validProduct, cost: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza stock negativo", () => {
    const result = createProductSchema.safeParse({ ...validProduct, current_stock: -5 });
    expect(result.success).toBe(false);
  });

  it("rechaza stock decimal (debe ser entero)", () => {
    const result = createProductSchema.safeParse({ ...validProduct, current_stock: 5.5 });
    expect(result.success).toBe(false);
  });

  it("rechaza UUID de categoría inválido", () => {
    const result = createProductSchema.safeParse({ ...validProduct, category_id: "no-uuid" });
    expect(result.success).toBe(false);
  });

  it("rechaza UUID de proveedor inválido", () => {
    const result = createProductSchema.safeParse({ ...validProduct, supplier_id: "123" });
    expect(result.success).toBe(false);
  });

  it("acepta precio 0 (producto gratis)", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(true);
  });

  it("acepta stock 0", () => {
    const result = createProductSchema.safeParse({ ...validProduct, current_stock: 0 });
    expect(result.success).toBe(true);
  });

  it("rechaza NaN en precio", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: NaN });
    expect(result.success).toBe(false);
  });

  it("rechaza SKU mayor a 50 caracteres", () => {
    const result = createProductSchema.safeParse({ ...validProduct, sku: "A".repeat(51) });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// updateProductSchema
// ═══════════════════════════════════════════════════════
describe("updateProductSchema", () => {
  const validUpdate = {
    sku: "INV-001",
    name: "Abrigo Actualizado",
    price: 199900,
    cost: 90000,
    current_stock: 15,
    min_safety_stock: 5,
    category_id: "c0000001-0000-0000-0000-000000000001",
    supplier_id: "d0000001-0000-0000-0000-000000000001",
  };

  it("acepta una actualización válida", () => {
    const result = updateProductSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rechaza min_safety_stock negativo", () => {
    const result = updateProductSchema.safeParse({ ...validUpdate, min_safety_stock: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza campos faltantes", () => {
    const { sku, ...sinSku } = validUpdate;
    const result = updateProductSchema.safeParse(sinSku);
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// partialUpdateProductSchema
// ═══════════════════════════════════════════════════════
describe("partialUpdateProductSchema", () => {
  it("acepta un solo campo", () => {
    const result = partialUpdateProductSchema.safeParse({ name: "Nuevo nombre" });
    expect(result.success).toBe(true);
  });

  it("acepta múltiples campos", () => {
    const result = partialUpdateProductSchema.safeParse({ price: 50000, current_stock: 20 });
    expect(result.success).toBe(true);
  });

  it("rechaza objeto vacío", () => {
    const result = partialUpdateProductSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rechaza campos inválidos dentro del parcial", () => {
    const result = partialUpdateProductSchema.safeParse({ price: -100 });
    expect(result.success).toBe(false);
  });

  it("ignora campos no permitidos", () => {
    const result = partialUpdateProductSchema.safeParse({ unknownField: "test" });
    // Zod strips unknown fields, so it becomes empty → rejected
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// uuidSchema
// ═══════════════════════════════════════════════════════
describe("uuidSchema", () => {
  it("acepta UUID v4 válido", () => {
    expect(uuidSchema.safeParse("c0000001-0000-0000-0000-000000000001").success).toBe(true);
  });

  it("acepta UUID generado estándar", () => {
    expect(uuidSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(true);
  });

  it("rechaza string vacío", () => {
    expect(uuidSchema.safeParse("").success).toBe(false);
  });

  it("rechaza string arbitrario", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
  });

  it("rechaza número", () => {
    expect(uuidSchema.safeParse(12345).success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// formatZodError
// ═══════════════════════════════════════════════════════
describe("formatZodError", () => {
  it("formatea múltiples errores separados por coma", () => {
    const result = createProductSchema.safeParse({ sku: "", name: "", price: -1, cost: -1, current_stock: -1, category_id: "x", supplier_id: "y" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = formatZodError(result.error);
      expect(msg).toContain(",");
      expect(msg.length).toBeGreaterThan(10);
    }
  });
});
