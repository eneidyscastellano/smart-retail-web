import { deepseek } from '@ai-sdk/deepseek';
import { streamText, dynamicTool } from 'ai';
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

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    if (lastUserMsg) {
      await saveMessage(conversationId, 'user', String(lastUserMsg.content));
    }

    const tools = {
      get_current_stock: dynamicTool({
        description: 'Obtiene los niveles actuales de inventario de todos los productos y tiempos de entrega del proveedor.',
        inputSchema: z.object({}),
        execute: async () => {
          return await getCurrentStock();
        },
      }),

      get_sales_velocity: dynamicTool({
        description: 'Calcula el promedio de ventas diarias de los productos en los últimos X días.',
        inputSchema: z.object({
          days: z.number().describe('Numero de dias hacia atras a analizar'),
        }),
        execute: async (input) => {
          const { days } = input as { days: number };
          return await getSalesVelocity(days);
        },
      }),

      create_ai_recommendation: dynamicTool({
        description: 'Crea una alerta de reabastecimiento en la base de datos.',
        inputSchema: z.object({
          product_id: z.string().describe('El UUID del producto'),
          recommended_order_qty: z.number().describe('Cantidad sugerida a comprar'),
          reason: z.string().describe('Explicacion de por que se necesita esta compra'),
        }),
        execute: async (input) => {
          const { product_id, recommended_order_qty, reason } = input as {
            product_id: string;
            recommended_order_qty: number;
            reason: string;
          };
          try {
            return await createAiRecommendation(product_id, recommended_order_qty, reason);
          } catch (err: unknown) {
            return "Error: " + (err instanceof Error ? err.message : String(err));
          }
        },
      }),
    };

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system:
        'Eres el Asistente de Inteligencia de Negocios de Smart Retail. ' +
        'Consulta SIEMPRE las herramientas con datos reales antes de responder. ' +
        'Responde de forma CONCISA: máximo 3-4 frases o una tabla corta. ' +
        'Si un producto se agotará antes de que el proveedor entregue, usa create_ai_recommendation.',
      messages,
      tools,
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

    return result.toTextStreamResponse();

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('ERROR EN CHAT:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
