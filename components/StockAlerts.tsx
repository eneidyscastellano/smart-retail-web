"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Bell } from "lucide-react";

interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: "critical" | "warning";
}

export default function StockAlerts({ alerts }: { alerts: StockAlert[] }) {
  const [visible, setVisible] = useState<StockAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Verificar localStorage para no mostrar alertas ya descartadas en esta sesión
    try {
      const stored = localStorage.getItem("dismissed-alerts");
      if (stored) {
        setDismissed(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignorar
    }
  }, []);

  useEffect(() => {
    // Filtrar alertas no descartadas
    const pending = alerts.filter((a) => !dismissed.has(a.id));
    setVisible(pending);

    // Mostrar el panel automáticamente si hay alertas críticas
    if (pending.some((a) => a.severity === "critical") && pending.length > 0) {
      setShowPanel(true);
    }
  }, [alerts, dismissed]);

  function dismiss(id: string) {
    const updated = new Set(dismissed);
    updated.add(id);
    setDismissed(updated);
    try {
      localStorage.setItem("dismissed-alerts", JSON.stringify([...updated]));
    } catch {
      // ignorar
    }
  }

  function dismissAll() {
    const updated = new Set(alerts.map((a) => a.id));
    setDismissed(updated);
    setShowPanel(false);
    try {
      localStorage.setItem("dismissed-alerts", JSON.stringify([...updated]));
    } catch {
      // ignorar
    }
  }

  if (visible.length === 0) return null;

  const criticalCount = visible.filter((a) => a.severity === "critical").length;
  const warningCount = visible.filter((a) => a.severity === "warning").length;

  return (
    <>
      {/* Botón flotante de notificaciones */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-white shadow-lg hover:bg-red-700 transition-all animate-bounce"
        >
          <Bell className="h-5 w-5" />
          <span className="text-sm font-medium">
            {visible.length} alerta{visible.length > 1 ? "s" : ""} de stock
          </span>
        </button>
      )}

      {/* Panel de notificaciones */}
      {showPanel && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[500px] rounded-xl border border-zinc-200 bg-white shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 text-white">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-semibold text-sm">Alertas de Stock</span>
              {criticalCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs">
                  {criticalCount} crítica{criticalCount > 1 ? "s" : ""}
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs">
                  {warningCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={dismissAll}
                className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded"
              >
                Descartar todo
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-zinc-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {visible.map((alert) => (
              <div
                key={alert.id}
                className={`relative rounded-lg border p-3 ${
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <button
                  onClick={() => dismiss(alert.id)}
                  className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start gap-2 pr-6">
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {alert.productName}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Stock actual: <strong>{alert.currentStock}</strong> / Mínimo:{" "}
                      <strong>{alert.minStock}</strong>
                    </p>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        alert.severity === "critical" ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {alert.severity === "critical"
                        ? "⚠️ Stock agotado o en cero"
                        : "📉 Por debajo del mínimo de seguridad"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
