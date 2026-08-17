"use client";

import { useState, useTransition } from "react";
import { BarChart3, Package, RefreshCw } from "lucide-react";
import { refreshData } from "@/app/actions";

export default function DashboardTabs({
  children,
}: {
  children: [React.ReactNode, React.ReactNode];
}) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventario">("dashboard");
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      await refreshData();
    });
  }

  return (
    <div className="space-y-5">
      {/* Tab navigation */}
      <nav className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 p-1 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={"inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all " + (
              activeTab === "dashboard"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("inventario")}
            className={"inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all " + (
              activeTab === "inventario"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            )}
          >
            <Package className="h-4 w-4" />
            Inventario
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isPending}
          title="Actualizar datos"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/60 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-white hover:border-zinc-300 hover:text-zinc-800 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={"h-3.5 w-3.5 " + (isPending ? "animate-spin" : "")} />
          {isPending ? "..." : "Refrescar"}
        </button>
      </nav>

      {/* Tab content */}
      <div className={activeTab === "dashboard" ? "" : "hidden"}>
        {children[0]}
      </div>
      <div className={activeTab === "inventario" ? "" : "hidden"}>
        {children[1]}
      </div>
    </div>
  );
}
