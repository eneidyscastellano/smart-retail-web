import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createProductSchema, formatZodError } from "@/lib/validations";

// GET: Obtener todos los productos
export async function GET() {
  try {
    const products = await query(`
      SELECT p.id, p.sku, p.name, c.name as category, p.price, p.current_stock 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `);
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const { sku, name, price, cost, current_stock, category_id, supplier_id } = validation.data;

    const result = await query(
      `INSERT INTO products (sku, name, price, cost, current_stock, category_id, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [sku, name, price, cost, current_stock, category_id, supplier_id]
    );

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
