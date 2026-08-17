"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesDataPoint {
  date: string;
  total: number;
}

function formatAxisCOP(value: number): string {
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return "$" + Math.round(value / 1_000) + "K";
  return "$" + value;
}

export default function SalesChart({ data }: { data: SalesDataPoint[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Tendencia de Ventas
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Últimos 7 días · COP</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-400 italic text-center py-8">
          No hay datos de ventas recientes.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: "#a1a1aa" }}
            />
            <YAxis
              tickFormatter={formatAxisCOP}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              width={50}
              tick={{ fill: "#a1a1aa" }}
            />
            <Tooltip
              formatter={(value) => ["$" + Number(value).toLocaleString("es-CO"), "Ingresos"]}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e4e4e7",
                boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Bar dataKey="total" fill="url(#salesGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#3f3f46" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
