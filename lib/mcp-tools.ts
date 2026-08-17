/**
 * Herramientas MCP ejecutadas in-process (sin spawn de proceso hijo).
 * Equivalente funcional a smart-retail-mcp/src/index.ts pero invocable
 * directamente desde el API route del chat.
 * 
 * Esto permite el deploy en Vercel (serverless) donde no se puede
 * hacer spawn de procesos hijos con archivos TypeScript.
 */

import { query } from "./db";

export async function getCurrentStock() {
  const stock = await query(`
    SELECT p.id, p.name, p.current_stock, p.min_safety_stock, s.lead_time_days
    FROM products p
    JOIN suppliers s ON p.supplier_id = s.id
  `);
  return JSON.stringify(stock, null, 2);
}

export async function getSalesVelocity(days?: number) {
  const safeDays =
    typeof days === "number" && Number.isFinite(days) && days > 0
      ? Math.floor(days)
      : 30;

  const velocity = await query(
    `
    SELECT
      p.id as product_id,
      p.name,
      p.current_stock,
      s.lead_time_days,
      COALESCE(SUM(fi.quantity), 0) as total_sold_in_period,
      ROUND(COALESCE(SUM(fi.quantity), 0)::numeric / NULLIF($1::int, 0), 2) as daily_sales_velocity
    FROM products p
    JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN (
      SELECT si.product_id, si.quantity
      FROM sale_items si
      JOIN sales sa ON si.sale_id = sa.id
      WHERE sa.sale_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
    ) fi ON fi.product_id = p.id
    GROUP BY p.id, p.name, p.current_stock, s.lead_time_days
    `,
    [safeDays]
  );
  return JSON.stringify(velocity, null, 2);
}

export async function createAiRecommendation(
  product_id: string,
  recommended_order_qty: number,
  reason: string
) {
  if (!product_id || typeof product_id !== "string") {
    throw new Error("Falta el argumento obligatorio 'product_id'");
  }
  if (recommended_order_qty === undefined || recommended_order_qty === null) {
    throw new Error("Falta el argumento obligatorio 'recommended_order_qty'");
  }
  if (!reason || typeof reason !== "string") {
    throw new Error("Falta el argumento obligatorio 'reason'");
  }

  const result = await query(
    `INSERT INTO ai_recommendations (product_id, recommended_order_qty, reason)
     VALUES ($1, $2, $3) RETURNING *;`,
    [product_id, recommended_order_qty, reason]
  );

  return "Recomendación creada con éxito: " + JSON.stringify(result[0]);
}
