"use client";

import { useState, useTransition } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await login(formData);
      if (!result.success) {
        setError(result.error || "Credenciales inválidas");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="username" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="admin"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm outline-none focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-700"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm outline-none focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-200 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-700"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:from-zinc-700 hover:to-zinc-800 disabled:opacity-50 transition-all shadow-sm hover:shadow"
      >
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900">DEMO</span>
        </div>
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Usuario: <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[11px]">admin</code>{" "}
        Contraseña: <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[11px]">admin123</code>
      </p>
    </form>
  );
}
