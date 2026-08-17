import { query } from './db';

// Garantiza (de forma idempotente y tolerante a concurrencia) las tablas de historial.
export async function ensureChatSchema() {
  // Verifica si la tabla ya existe usando to_regclass (evita conflictos de pg_type).
  const exists = await query(
    "SELECT to_regclass('public.chat_conversations') AS c1, to_regclass('public.chat_messages') AS c2"
  );
  const conv = exists[0]?.c1;
  const msg = exists[0]?.c2;

  if (!conv) {
    try {
      await query(`
        CREATE TABLE chat_conversations (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (e: any) {
      // 42P07 = relation already exists (posible condición de carrera)
      if (e?.code !== '42P07') throw e;
    }
  }

  if (!msg) {
    try {
      await query(`
        CREATE TABLE chat_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
        ON chat_messages (conversation_id, created_at ASC)
      `);
    } catch (e: any) {
      if (e?.code !== '42P07') throw e;
    }
  }
}

// Asegura que exista la conversación. Si no, la crea.
export async function ensureConversation(conversationId: string) {
  await query(
    'INSERT INTO chat_conversations (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
    [conversationId]
  );
}

// Devuelve los mensajes de una conversación, en orden cronológico.
export async function getConversationMessages(conversationId: string): Promise<{ role: string; content: string }[]> {
  const rows = await query(
    'SELECT role, content FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
  return rows.map((r) => ({ role: r.role, content: r.content }));
}

// Guarda un mensaje nuevo en una conversación.
export async function saveMessage(conversationId: string, role: string, content: string) {
  await ensureConversation(conversationId);
  await query(
    'INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)',
    [conversationId, role, content]
  );
}

// Borra el historial de una conversación (por si se quiere "reiniciar").
export async function clearConversation(conversationId: string) {
  await query('DELETE FROM chat_conversations WHERE id = $1', [conversationId]);
}
