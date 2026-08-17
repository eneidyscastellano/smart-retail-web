import { z } from "zod";

// Esquema para crear un producto
export const createProductSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio").max(50),
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  current_stock: z.number().int().min(0, "El stock debe ser un entero positivo"),
  category_id: z.string().uuid("ID de categoría inválido"),
  supplier_id: z.string().uuid("ID de proveedor inválido"),
});

// Esquema para actualizar un producto (todos los campos obligatorios desde el form)
export const updateProductSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio").max(50),
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  current_stock: z.number().int().min(0, "El stock debe ser un entero positivo"),
  min_safety_stock: z.number().int().min(0, "El stock mínimo debe ser un entero positivo"),
  category_id: z.string().uuid("ID de categoría inválido"),
  supplier_id: z.string().uuid("ID de proveedor inválido"),
});

// Esquema para actualización parcial vía API (todos opcionales)
export const partialUpdateProductSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  current_stock: z.number().int().min(0).optional(),
  min_safety_stock: z.number().int().min(0).optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Debe enviar al menos un campo para actualizar",
});

// Esquema para validar UUID en parámetros de ruta
export const uuidSchema = z.string().uuid("ID inválido");

// Helper para extraer el primer error legible de un ZodError
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(", ");
}
