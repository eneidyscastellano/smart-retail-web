import { deepseek } from '@ai-sdk/deepseek';
import { dynamicTool, isLoopFinished, isStepCount, streamText } from 'ai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod';
import path from 'path';
import {
  ensureChatSchema,
  getConversationMessages,
  saveMessage,
} from '../../../lib/chat-store';

export const maxDuration = 60;

// Ruta absoluta al servidor MCP — robusta sin importar desde dónde corra Next.js
const MCP_PATH = path.resolve(process.cwd(), '../smart-retail-mcp/src/index.ts');

async function connectToMCP() {
  console.log('MCP path:', MCP_PATH);

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', MCP_PATH],
  });

  const mcpClient = new Client(
    { name: 'nextjs-retail-app', version: '1.0.0' },
    { capabilities: {} }
  );

  await mcpClient.connect(transport);
  return mcpClient;
}

// GET: permite al cliente recuperar el historial persistido de una conversación.
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

    // Persistir el mensaje del usuario antes de consultar a la IA.
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      await saveMessage(conversationId, 'user', String(lastUserMsg.content));
    }

    console.log('1. Intentando conectar al MCP...');
    const mcpClient = await connectToMCP();
    console.log('2. MCP conectado con exito.');

    const tools = {
      get_current_stock: dynamicTool({
        description:
          'Obtiene los niveles actuales de inventario de todos los productos y tiempos de entrega del proveedor.',
        inputSchema: z.object({}),
        execute: async () => {
          const result = await mcpClient.callTool({ name: 'get_current_stock' });
          return result.content;
        },
      }),

      get_sales_velocity: dynamicTool({
        description:
          'Calcula el promedio de ventas diarias de los productos en los últimos X días.',
        inputSchema: z.object({
          days: z.number().describe('Numero de dias hacia atras a analizar (ej. 7, 15, 30)'),
        }),
        execute: async (input) => {
          const { days } = (input ?? {}) as { days?: number };
          const result = await mcpClient.callTool({
            name: 'get_sales_velocity',
            arguments: { days },
          });
          return result.content;
        },
      }),

      create_ai_recommendation: dynamicTool({
        description:
          'Crea una alerta de reabastecimiento en la base de datos cuando el stock se agotara antes de que el proveedor pueda entregar.',
        inputSchema: z.object({
          product_id: z.string().describe('El UUID del producto'),
          recommended_order_qty: z.number().describe('Cantidad sugerida a comprar'),
          reason: z.string().describe('Explicacion logica de por que se necesita esta compra'),
        }),
        execute: async (input) => {
          const result = await mcpClient.callTool({
            name: 'create_ai_recommendation',
            arguments: input as Record<string, unknown> | undefined,
          });
          return result.content;
        },
      }),
    };

    console.log('3. Llamando a DeepSeek...');
    const result = await streamText({
      model: deepseek('deepseek-chat'),
      instructions:
        'Eres el Asistente de Inteligencia de Negocios de Smart Retail para gestionar inventario. Reglas obligatorias: ' +
        '1) Consulta SIEMPRE las herramientas (get_current_stock, get_sales_velocity) con datos reales antes de responder; nunca inventes cifras. ' +
        '2) Responde SIEMPRE de forma CONCISA y RESUMIDA: máximo 3-4 frases breves o una tabla corta con lo esencial (producto, stock, riesgo, acción). ' +
        'Evita párrafos largos, cálculos extensos y textos de relleno. Ve directo a la conclusión y recomendación. ' +
        '3) Si un producto se agotará antes de que el proveedor entregue, o está por debajo del mínimo de seguridad, usa create_ai_recommendation. ' +
        '4) Si te preguntan algo que ya respondiste antes en la conversación, apóyate en el historial para responder de forma más precisa. ' +
        'Usa lenguaje natural y claro.',
      messages,
      tools,
      stopWhen: [isLoopFinished(), isStepCount(5)],
      onEnd: async ({ text }) => {
        try {
          if (text) {
            await saveMessage(conversationId, 'assistant', text);
          }
        } catch (e) {
          console.error('Error al guardar respuesta del asistente:', e);
        }
      },
    });

    console.log('4. Stream iniciado, enviando respuesta...');
    return result.toUIMessageStreamResponse();

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('ERROR CRITICO EN EL CHAT:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
