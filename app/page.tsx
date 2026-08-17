// app/page.tsx
import { query } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertTriangle, Lightbulb, Trash2, LogOut, Package } from "lucide-react";
import { formatCOP } from "@/lib/utils";
import ChatPanel from "@/components/ChatPanel";
import { approveRecommendation, rejectRecommendation, deleteProduct } from "./actions";
import { logout } from "./logout/actions";
import SalesChart from "@/components/SalesChart";
import AddProductDialog from "@/components/AddProductDialog";
import EditProductDialog from "@/components/EditProductDialog";
import StockAlerts from "@/components/StockAlerts";
import MetricsCards from "@/components/MetricsCards";
import TopProductsChart from "@/components/TopProductsChart";
import MarginByCategory from "@/components/MarginByCategory";
import DashboardTabs from "@/components/DashboardTabs";
import ChatToggle from "@/components/ChatToggle";

interface Product {
  id: string;
  sku: string;
  name: string;
  category_name: string;
  category_id: string;
  supplier_id: string;
  price: number;
  cost: number;
  current_stock: number;
  min_safety_stock: number;
}

interface Recommendation {
  id: string;
  product_name: string;
  recommended_order_qty: number;
  reason: string;
  status: string;
  created_at: string;
}

interface SalesDataPoint {
  date: string;
  total: number;
}

async function getProducts(): Promise<Product[]> {
  const products = await query(`
    SELECT 
      p.id, p.sku, p.name, 
      c.name as category_name, 
      p.category_id, p.supplier_id, 
      p.price, p.cost, 
      p.current_stock, p.min_safety_stock
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.name ASC
  `);
  return products as Product[];
}

async function getRecommendations(): Promise<Recommendation[]> {
  const recs = await query(`
    SELECT 
      r.id, p.name as product_name, 
      r.recommended_order_qty, r.reason, r.status, r.created_at
    FROM ai_recommendations r
    JOIN products p ON r.product_id = p.id
    WHERE r.status = 'PENDING'
    ORDER BY r.created_at DESC
  `);
  return recs as Recommendation[];
}

async function getSalesTrend(): Promise<SalesDataPoint[]> {
  const sales = await query(`
    SELECT 
      TO_CHAR(sale_date, 'DD/MM') as date,
      COALESCE(SUM(total_amount), 0) as total
    FROM sales
    WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY TO_CHAR(sale_date, 'DD/MM'), DATE(sale_date)
    ORDER BY DATE(sale_date) ASC
  `);
  return sales.map((row) => ({
    date: row.date as string,
    total: parseFloat(row.total),
  }));
}

async function getCategories() {
  return await query(`SELECT id, name FROM categories ORDER BY name ASC`);
}

async function getSuppliers() {
  return await query(`SELECT id, name, lead_time_days FROM suppliers ORDER BY name ASC`);
}

async function getTopProducts() {
  const rows = await query(`
    SELECT 
      p.name,
      COALESCE(SUM(si.quantity), 0) as total_sold,
      COALESCE(SUM(si.quantity * si.unit_price), 0) as revenue
    FROM products p
    LEFT JOIN sale_items si ON si.product_id = p.id
    LEFT JOIN sales s ON si.sale_id = s.id AND s.sale_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(si.quantity), 0) > 0
    ORDER BY total_sold DESC
    LIMIT 5
  `);
  return rows.map((r) => ({
    name: r.name as string,
    totalSold: parseInt(r.total_sold),
    revenue: parseFloat(r.revenue),
  }));
}

async function getMarginByCategory() {
  const rows = await query(`
    SELECT 
      c.name as category,
      ROUND(AVG((p.price - p.cost) / NULLIF(p.price, 0) * 100)::numeric, 1) as margin,
      COUNT(p.id) as product_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY margin DESC
  `);
  return rows.map((r) => ({
    category: r.category as string,
    margin: parseFloat(r.margin),
    productCount: parseInt(r.product_count),
  }));
}

export default async function InventoryPage() {
  const [products, recommendations, salesData, categories, suppliers, topProducts, marginByCategory] = await Promise.all([
    getProducts(),
    getRecommendations(),
    getSalesTrend(),
    getCategories(),
    getSuppliers(),
    getTopProducts(),
    getMarginByCategory(),
  ]);

  // Métricas KPI
  const stockAlerts = products
    .filter((p) => p.current_stock <= p.min_safety_stock)
    .map((p) => ({
      id: p.id,
      productName: p.name,
      currentStock: p.current_stock,
      minStock: p.min_safety_stock,
      severity: (p.current_stock === 0 ? "critical" : "warning") as "critical" | "warning",
    }));

  const totalRevenue = salesData.reduce((sum, d) => sum + d.total, 0);
  const averageMargin =
    products.length > 0
      ? products.reduce((sum, p) => {
          const price = Number(p.price);
          const cost = Number(p.cost);
          return sum + (price > 0 ? ((price - cost) / price) * 100 : 0);
        }, 0) / products.length
      : 0;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.cost) * p.current_stock,
    0
  );
  const productsAtRisk = stockAlerts.length;

  // ─── Contenido del tab "Dashboard" ───────────────────────────
  const dashboardContent = (
    <div className="space-y-6">
      {/* KPIs */}
      <MetricsCards
        data={{ totalRevenue, averageMargin, totalProducts: products.length, productsAtRisk, totalInventoryValue }}
      />

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesChart data={salesData} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Margen por categoría */}
      <MarginByCategory data={marginByCategory} />

      {/* Recomendaciones de IA */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
            <Lightbulb className="h-5 w-5" />
            Insights de la IA
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-500">
            Recomendaciones de reabastecimiento generadas automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-sm text-amber-700/70 dark:text-amber-500/70 italic">
              No hay recomendaciones pendientes en este momento.
            </p>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-amber-200 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-100">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      Pedir {rec.recommended_order_qty}x {rec.product_name}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 border-amber-400 text-amber-700">
                      Pendiente
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {rec.reason}
                  </p>
                  <div className="flex gap-2">
                    <form action={approveRecommendation.bind(null, rec.id)}>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                      >
                        Aprobar Orden
                      </button>
                    </form>
                    <form action={rejectRecommendation.bind(null, rec.id)}>
                      <button
                        type="submit"
                        className="text-xs px-3 py-1 rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        Ignorar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ─── Contenido del tab "Inventario" ──────────────────────────
  const inventarioContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gestión de Inventario
          </h2>
          <p className="text-zinc-500 mt-1">
            {products.length} productos · {productsAtRisk} en riesgo
          </p>
        </div>
        <AddProductDialog categories={categories} suppliers={suppliers} />
      </div>

      <div className="rounded-lg border bg-white dark:bg-zinc-900 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="hidden lg:table-cell">Costo</TableHead>
              <TableHead className="hidden lg:table-cell text-right">Margen</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="hidden md:table-cell text-right">Mínimo</TableHead>
              <TableHead className="text-right">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const price = Number(product.price);
              const cost = Number(product.cost);
              const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-600">{product.category_name}</TableCell>
                  <TableCell>{formatCOP(product.price)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-zinc-500">{formatCOP(product.cost)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    <span className={margin >= 50 ? "text-emerald-600 font-medium" : "text-zinc-600"}>
                      {margin.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.current_stock}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-zinc-500">
                    {product.min_safety_stock}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.current_stock === 0 ? (
                      <Badge variant="destructive">Agotado</Badge>
                    ) : product.current_stock <= product.min_safety_stock ? (
                      <Badge variant="destructive">Stock Bajo</Badge>
                    ) : (
                      <Badge variant="default">Óptimo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditProductDialog
                        product={product}
                        categories={categories}
                        suppliers={suppliers}
                      />
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <main className="max-w-[1600px] mx-auto space-y-4">
      {/* Notificaciones proactivas de stock */}
      <StockAlerts alerts={stockAlerts} />

      {/* Barra superior */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Smart Retail
            </h1>
            <p className="text-[11px] text-zinc-500 -mt-0.5">Sistema de Inventario Inteligente</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/60 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar Sesión
          </button>
        </form>
      </header>

      {/* Layout principal */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Contenido principal: tabs con dashboard e inventario */}
        <div className="flex-1 min-w-0 w-full">
          <DashboardTabs>
            {dashboardContent}
            {inventarioContent}
          </DashboardTabs>
        </div>

        {/* Chat: visible en desktop, oculto en móvil/tablet (se muestra via ChatToggle) */}
        <div className="hidden xl:block w-[380px] shrink-0 sticky top-4">
          <ChatPanel />
        </div>
      </div>

      {/* Chat flotante para pantallas pequeñas */}
      <div className="xl:hidden">
        <ChatToggle />
      </div>
    </main>
  );
}
