"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { updateProduct } from "@/app/actions";

interface EditableProduct {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  supplier_id: string;
  price: number;
  cost: number;
  current_stock: number;
  min_safety_stock: number;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
  lead_time_days: number;
}

export default function EditProductDialog({
  product,
  categories,
  suppliers,
}: {
  product: EditableProduct;
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Estado controlado para todos los campos del formulario
  const [sku, setSku] = useState(product.sku);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [cost, setCost] = useState(String(product.cost));
  const [currentStock, setCurrentStock] = useState(String(product.current_stock));
  const [minSafetyStock, setMinSafetyStock] = useState(String(product.min_safety_stock));
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [supplierId, setSupplierId] = useState(product.supplier_id);

  // Sincronizar cuando el dialog se abre (por si los props cambiaron desde el server)
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSku(product.sku);
      setName(product.name);
      setPrice(String(product.price));
      setCost(String(product.cost));
      setCurrentStock(String(product.current_stock));
      setMinSafetyStock(String(product.min_safety_stock));
      setCategoryId(product.category_id);
      setSupplierId(product.supplier_id);
    }
    setOpen(nextOpen);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProduct(product.id, formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Editar producto"
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto. Los cambios se guardan al hacer clic en &quot;Guardar Cambios&quot;.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-2">
          {/* SKU y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`sku-${product.id}`}>SKU</Label>
              <Input
                id={`sku-${product.id}`}
                name="sku"
                placeholder="Ej: INV-002"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`name-${product.id}`}>Nombre</Label>
              <Input
                id={`name-${product.id}`}
                name="name"
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Precio y Costo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`price-${product.id}`}>Precio Venta (COP)</Label>
              <Input
                id={`price-${product.id}`}
                name="price"
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`cost-${product.id}`}>Costo Compra (COP)</Label>
              <Input
                id={`cost-${product.id}`}
                name="cost"
                type="number"
                step="1"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Stock actual y stock mínimo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`current_stock-${product.id}`}>Stock Actual</Label>
              <Input
                id={`current_stock-${product.id}`}
                name="current_stock"
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`min_safety_stock-${product.id}`}>Stock Mínimo</Label>
              <Input
                id={`min_safety_stock-${product.id}`}
                name="min_safety_stock"
                type="number"
                min="0"
                value={minSafetyStock}
                onChange={(e) => setMinSafetyStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <Label htmlFor={`category_id-${product.id}`}>Categoría</Label>
            <select
              id={`category_id-${product.id}`}
              name="category_id"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Proveedor */}
          <div className="space-y-1">
            <Label htmlFor={`supplier_id-${product.id}`}>Proveedor</Label>
            <select
              id={`supplier_id-${product.id}`}
              name="supplier_id"
              required
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona un proveedor...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.lead_time_days} días entrega)
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
