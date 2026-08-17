import { deepseek } from '@ai-sdk/deepseek';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import {
  ensureChatSchema,
  getConversationMessages,
  saveMessage,
} from '../../../lib/chat-store';
import {
  getCurrentStock,
  getSalesVelocity,
  createAiRecommendation,
} from '../../../lib/mcp-tools';

export const maxDuration = 60;

// GET: recuperar historial de una conversación.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  if (!conversationId) {
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  await ensureChatSchema();
  const history = await getConversationMessages(conversationId);
  return new Response(JSON.stringify({ messages: history }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, conversationId = 'default' } = await req.json();
    await ensureChatSchema();

    // Persistir mensaje del usuario
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    if (lastUserMsg) {
      await saveMessage(conversationId, 'user', String(lastUserMsg.content));
    }

    // Herramientas disponibles para la IA (ejecución directa, sin MCP spawn)
    const tools = {
      get_current_stock: tool({
        description:
          'Obtiene los niveles actuales de inventario de todos los productos y tiempos de entrega del proveedor.',
        parameters: z.object({}),
        execute: async () => {
          const result = await getCurrentStock();
          return result;
        },
      }),

      get_sales_velocity: tool({
        description:
          'Calcula el promedio de ventas diarias de los productos en los últimos X días.',
        parameters: z.object({
          days: z.number().describe('Numero de dias hacia atras a analizar (ej. 7, 15, 30)'),
        }),
        execute: async ({ days }) => {
          const result = await getSalesVelocity(days);
          return result;
        },
      }),

      create_ai_recommendation: tool({
        description:
          'Crea una alerta de reabastecimiento en la base de datos cuando el stock se agotara antes de que el proveedor pueda entregar.',
        parameters: z.object({
          product_id: z.string().describe('El UUID del producto'),
          recommended_order_qty: z.number().describe('Cantidad sugerida a comprar'),
          reason: z.string().describe('Explicacion logica de por que se necesita esta compra'),
        }),
        execute: async ({ product_id, recommended_order_qty, reason }) => {
          try {
            const result = await createAiRecommendation(product_id, recommended_order_qty, reason);
            return result;
          } catch (err) {
            return "Error: " + (err instanceof Error ? err.message : String(err));
          }
        },
      }),
    };

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system:
        'Eres el Asistente de Inteligencia de Negocios de Smart Retail para gestionar inventario. Reglas obligatorias: ' +
        '1) Consulta SIEMPRE las herramientas (get_current_stock, get_sales_velocity) con datos reales antes de responder; nunca inventes cifras. ' +
        '2) Responde SIEMPRE de forma CONCISA y RESUMIDA: máximo 3-4 frases breves o una tabla corta con lo esencial (producto, stock, riesgo, acción). ' +
        'Evita párrafos largos, cálculos extensos y textos de relleno. Ve directo a la conclusión y recomendación. ' +
        '3) Si un producto se agotará antes de que el proveedor entregue, o está por debajo del mínimo de seguridad, usa create_ai_recommendation. ' +
        '4) Si te preguntan algo que ya respondiste antes en la conversación, apóyate en el historial para responder de forma más precisa. ' +
        'Usa lenguaje natural y claro.',
      messages,
      tools,
      maxSteps: 5,
      onFinish: async ({ text }) => {
        try {
          if (text) {
            await saveMessage(conversationId, 'assistant', text);
          }
        } catch (e) {
          console.error('Error guardando respuesta:', e);
        }
      },
    });

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('ERROR EN CHAT:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
