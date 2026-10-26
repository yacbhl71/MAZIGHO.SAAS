import { useState } from "react";
import { Eye, ShoppingBag, Check, Plus, Minus, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProductQuickViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: number;
    name: string;
    description?: string | null;
    price: number | string;
    originalPrice?: number | string | null;
    images?: { url: string }[];
    variants?: { id: number; name: string; price?: number }[];
  } | null;
  onAddToCart: (productId: number, quantity: number, variantId?: number) => void;
}

export default function ProductQuickViewModal({
  isOpen,
  onOpenChange,
  product,
  onAddToCart,
}: ProductQuickViewModalProps) {
  const configQuery = trpc.quickView.getConfig.useQuery();
  const config = configQuery.data;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product || (config && !config.enabled)) {
    return null;
  }

  const priceNum = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
  const images = product.images && product.images.length > 0 ? product.images : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" }];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
            <Eye className="w-4 h-4 text-indigo-600" />
            Aperçu Rapide Produit
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={images[selectedImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 ${
                      selectedImageIndex === idx ? "ring-2 ring-indigo-600 border-transparent" : "border-slate-200"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-snug">
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {priceNum.toFixed(2)} CHF
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {typeof product.originalPrice === "number" ? product.originalPrice.toFixed(2) : product.originalPrice} CHF
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Variants Matrix */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Variantes</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      size="xs"
                      variant={selectedVariantId === v.id ? "default" : "outline"}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={selectedVariantId === v.id ? "bg-indigo-600 text-white text-xs" : "text-xs"}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Quantité :</span>
                <div className="flex items-center border border-slate-300 rounded-md bg-white">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-3 text-xs font-bold">{quantity}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  onAddToCart(product.id, quantity, selectedVariantId);
                  toast.success("Produit ajouté au panier !");
                  onOpenChange(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 text-xs gap-2 shadow"
              >
                <ShoppingBag className="w-4 h-4" />
                Ajouter au Panier Express
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
