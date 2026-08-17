import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { partialUpdateProductSchema, uuidSchema, formatZodError } from "@/lib/validations";

// DELETE: Eliminar un producto por ID
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido." },
        { status: 400 }
      );
    }

    await query(`DELETE FROM products WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Actualizar un producto por ID (actualización parcial)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation = partialUpdateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: formatZodError(validation.error) },
        { status: 400 }
      );
    }

    const fields = validation.data;
    const keys = Object.keys(fields) as (keyof typeof fields)[];

    // Construir el UPDATE dinámicamente con parámetros posicionales ($1..$n)
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const values = keys.map((k) => fields[k]);

    const result = await query(
      `UPDATE products SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *;`,
      [...values, id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
