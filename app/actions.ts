"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createProductSchema,
  updateProductSchema,
  uuidSchema,
  formatZodError,
} from "@/lib/validations";

export async function createProduct(formData: FormData) {
  const raw = {
    sku: (formData.get("sku") as string)?.trim(),
    name: (formData.get("name") as string)?.trim(),
    price: Number(formData.get("price")),
    cost: Number(formData.get("cost")),
    current_stock: Number(formData.get("stock")),
    category_id: (formData.get("category_id") as string)?.trim(),
    supplier_id: (formData.get("supplier_id") as string)?.trim(),
  };

  const result = createProductSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }

  const { sku, name, price, cost, current_stock, category_id, supplier_id } =
    result.data;

  try {
    await query(
      `INSERT INTO products (sku, name, price, cost, current_stock, category_id, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sku, name, price, cost, current_stock, category_id, supplier_id]
    );
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creando producto:", error);
    return { success: false, error: "Error interno al crear el producto." };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: "ID de producto inválido." };
  }

  const raw = {
    sku: (formData.get("sku") as string)?.trim(),
    name: (formData.get("name") as string)?.trim(),
    price: Number(formData.get("price")),
    cost: Number(formData.get("cost")),
    current_stock: Number(formData.get("current_stock")),
    min_safety_stock: Number(formData.get("min_safety_stock")),
    category_id: (formData.get("category_id") as string)?.trim(),
    supplier_id: (formData.get("supplier_id") as string)?.trim(),
  };

  const result = updateProductSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }

  const {
    sku,
    name,
    price,
    cost,
    current_stock,
    min_safety_stock,
    category_id,
    supplier_id,
  } = result.data;

  try {
    await query(
      `UPDATE products
       SET sku = $1, name = $2, price = $3, cost = $4, current_stock = $5,
           min_safety_stock = $6, category_id = $7, supplier_id = $8
       WHERE id = $9`,
      [
        sku,
        name,
        price,
        cost,
        current_stock,
        min_safety_stock,
        category_id,
        supplier_id,
        id,
      ]
    );
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error actualizando producto:", error);
    return { success: false, error: "Error interno al actualizar." };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) return;

  try {
    await query(`DELETE FROM products WHERE id = $1`, [id]);
    revalidatePath("/");
  } catch (error) {
    console.error("Error eliminando producto:", error);
  }
}

export async function approveRecommendation(id: string): Promise<void> {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) return;

  try {
    await query(
      `UPDATE ai_recommendations SET status = 'APPROVED' WHERE id = $1`,
      [id]
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Error aprobando recomendacion:", error);
  }
}

export async function rejectRecommendation(id: string): Promise<void> {
  const idResult = uuidSchema.safeParse(id);
  if (!idResult.success) return;

  try {
    await query(
      `UPDATE ai_recommendations SET status = 'REJECTED' WHERE id = $1`,
      [id]
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Error rechazando recomendacion:", error);
  }
}

export async function refreshData(): Promise<void> {
  revalidatePath("/");
}
