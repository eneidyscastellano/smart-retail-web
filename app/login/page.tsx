import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";
import { Package } from "lucide-react";

export default async function LoginPage() {
  const isAuthenticated = await getSession();
  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center -mt-6">
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-zinc-200/60 bg-white/90 backdrop-blur-sm p-8 shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-lg mx-auto mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Smart Retail
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sistema de Inventario Inteligente
            </p>
          </div>
          <LoginForm />
        </div>
        <p className="text-center text-[11px] text-zinc-400 mt-4">
          Desarrollado con Next.js 16 + IA Agéntica (MCP)
        </p>
      </div>
    </main>
  );
}
