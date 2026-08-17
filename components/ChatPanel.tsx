'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import MarkdownMessage from './MarkdownMessage';

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'smart-retail-chat-conversation';

function getConversationId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'default';
  }
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMsg[]>([]);
  messagesRef.current = messages;

  // Generar id de conversación de forma estable.
  const conversationIdRef = useRef<string>('');
  if (!conversationIdRef.current) conversationIdRef.current = getConversationId();

  // Cargar el historial persistido de la conversación al montar.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(conversationIdRef.current)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            const restored: ChatMsg[] = data.messages.map((m: { role: string; content: string }, i: number) => ({
              id: `${i}-${Date.now()}`,
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content ?? '',
            }));
            setMessages(restored);
          }
        }
      } catch (e) {
        console.error('Error cargando historial:', e);
      }
    })();
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: text };
    const updated = [...messagesRef.current, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        let errText = 'Error del servidor';
        try { errText = (await res.json()).error || errText; } catch (_) {}
        setMessages([...updated, { id: `a-${Date.now()}`, role: 'assistant', content: `⚠️ Error: ${errText}` }]);
        setIsLoading(false);
        return;
      }

      if (!res.body) {
        setMessages([...updated, { id: `a-${Date.now()}`, role: 'assistant', content: 'Respuesta vacía.' }]);
        setIsLoading(false);
        return;
      }

      const aiId = `a-${Date.now()}`;
      setMessages([...updated, { id: aiId, role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accText = '';
      const latest = { updated, aiId, acc: '' };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') break;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'text-delta') {
              accText += evt.delta ?? '';
              const next = [...latest.updated, { id: latest.aiId, role: 'assistant' as const, content: accText }];
              setMessages(next);
            }
          } catch (_) { /* ignorar líneas no JSON válidas */ }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === aiId && !m.content ? { ...m, content: accText || '(sin respuesta)' } : m))
      );
      setIsLoading(false);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: '⚠️ Error de conexión. Intenta de nuevo.' },
      ]);
      setIsLoading(false);
    }
  }

  function handleClear() {
    if (isLoading) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    setMessages([]);
    conversationIdRef.current = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try { localStorage.setItem(STORAGE_KEY, conversationIdRef.current); } catch (_) {}
  }

  return (
    <div className="flex flex-col h-[600px] w-full rounded-xl overflow-hidden shadow-xl border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b bg-slate-900 text-white shrink-0 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">🤖 Smart Retail AI</h2>
          <p className="text-xs text-slate-300">Asistente Agéntico con MCP · con historial</p>
        </div>
        {messages.length > 0 && !isLoading && (
          <button
            onClick={handleClear}
            title="Limpiar historial de esta conversación"
            className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center mt-8">
            Pregunta algo, por ejemplo:<br />
            &quot;¿Qué productos se agotarán pronto?&quot;
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[85%] text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white whitespace-pre-wrap'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.role === 'user' ? (
                <>{m.content}</>
              ) : (
                m.content
                  ? <MarkdownMessage content={m.content} />
                  : (isLoading && <span className="text-slate-400">…</span>)
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <p className="text-xs text-slate-400 italic">La IA está pensando...</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — HTML nativo */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 bg-slate-50 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: ¿Qué productos se agotarán pronto?"
          disabled={isLoading}
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
