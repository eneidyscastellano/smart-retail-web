"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopProduct {
  name: string;
  totalSold: number;
  revenue: number;
}

const COLORS = ["#18181b", "#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b"];

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Top Productos
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Por unidades vendidas (7 días)</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-400 italic text-center py-8">
          No hay datos de ventas.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: "#a1a1aa" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: "#71717a" }}
              tickFormatter={(value: string) =>
                value.length > 14 ? value.slice(0, 13) + "…" : value
              }
            />
            <Tooltip
              formatter={(value: number) => [value + " uds", "Vendidas"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e4e4e7",
                boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Bar dataKey="totalSold" radius={[0, 6, 6, 0]} barSize={20}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
