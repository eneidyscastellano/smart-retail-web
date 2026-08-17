"use client";

import { DollarSign, TrendingUp, Package, AlertTriangle } from "lucide-react";

interface MetricsData {
  totalRevenue: number;
  averageMargin: number;
  totalProducts: number;
  productsAtRisk: number;
  totalInventoryValue: number;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "M";
  }
  if (value >= 1_000) {
    return "$" + Math.round(value / 1_000) + "K";
  }
  return "$" + value.toFixed(0);
}

export default function MetricsCards({ data }: { data: MetricsData }) {
  const cards = [
    {
      title: "Ventas (7 días)",
      value: formatCompact(data.totalRevenue),
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Margen Promedio",
      value: data.averageMargin.toFixed(1) + "%",
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Valor Inventario",
      value: formatCompact(data.totalInventoryValue),
      icon: Package,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      title: "En Riesgo",
      value: String(data.productsAtRisk) + " / " + String(data.totalProducts),
      icon: AlertTriangle,
      gradient: data.productsAtRisk > 0 ? "from-red-500 to-rose-600" : "from-emerald-500 to-teal-600",
      iconBg: data.productsAtRisk > 0 ? "bg-red-500/10" : "bg-emerald-500/10",
      iconColor: data.productsAtRisk > 0 ? "text-red-600" : "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800"
        >
          {/* Gradient accent bar */}
          <div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r " + card.gradient} />
          
          <div className="flex items-start justify-between pt-1">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {card.value}
              </p>
            </div>
            <div className={"rounded-xl p-2 " + card.iconBg}>
              <card.icon className={"h-4 w-4 " + card.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
