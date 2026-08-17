"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

export default function ChatToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante para abrir chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-white shadow-lg hover:bg-zinc-700 transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Chat IA</span>
        </button>
      )}

      {/* Panel de chat expandido */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Chat container */}
          <div className="relative w-full sm:max-w-md sm:mx-auto z-10">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-2 sm:top-2 sm:right-2 z-20 p-1.5 rounded-full bg-white/90 text-zinc-600 hover:bg-white shadow"
            >
              <X className="h-4 w-4" />
            </button>
            <ChatPanel />
          </div>
        </div>
      )}
    </>
  );
}
