"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface CategoryMargin {
  category: string;
  margin: number;
  productCount: number;
}

const COLORS = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

export default function MarginByCategory({ data }: { data: CategoryMargin[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Margen por Categoría
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">Porcentaje de ganancia promedio</p>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-zinc-400 italic text-center py-8">
          No hay datos disponibles.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: "#71717a" }}
              tickFormatter={(value: string) =>
                value.length > 10 ? value.slice(0, 9) + "…" : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fill: "#a1a1aa" }}
              tickFormatter={(value: number) => value + "%"}
              width={40}
            />
            <Tooltip
              formatter={(value: number, _name: string, props: { payload: CategoryMargin }) => [
                value.toFixed(1) + "% (" + props.payload.productCount + " productos)",
                "Margen",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e4e4e7",
                boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Bar dataKey="margin" radius={[6, 6, 0, 0]} barSize={36}>
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
