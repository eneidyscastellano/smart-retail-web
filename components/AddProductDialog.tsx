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
import { createProduct } from "@/app/actions";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
  lead_time_days: number;
}

export default function AddProductDialog({
  categories,
  suppliers,
}: {
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createProduct(formData);
      if (result && !result.success) {
        setError(result.error || "Error desconocido");
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-zinc-700 transition-colors"
      >
        + Nuevo Producto
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Producto</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo producto para el inventario.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SKU y Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="Ej: INV-002" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Nombre del producto" required />
            </div>
          </div>

          {/* Precio y Costo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">Precio Venta (COP)</Label>
              <Input id="price" name="price" type="number" step="1" min="0" placeholder="0" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cost">Costo Compra (COP)</Label>
              <Input id="cost" name="cost" type="number" step="1" min="0" placeholder="0" required />
            </div>
          </div>

          {/* Stock inicial */}
          <div className="space-y-1">
            <Label htmlFor="stock">Stock Inicial</Label>
            <Input id="stock" name="stock" type="number" min="0" placeholder="0" required />
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <Label htmlFor="category_id">Categoría</Label>
            <select
              id="category_id"
              name="category_id"
              required
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
            <Label htmlFor="supplier_id">Proveedor</Label>
            <select
              id="supplier_id"
              name="supplier_id"
              required
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
            {isPending ? "Guardando..." : "Guardar Producto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
