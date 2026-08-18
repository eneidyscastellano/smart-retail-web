import { Pool } from 'pg';

// En serverless (Vercel), cada invocación puede ser un nuevo container.
// Configuramos el pool con limits bajos para evitar conexiones colgadas.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 1, // Una sola conexión en serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
