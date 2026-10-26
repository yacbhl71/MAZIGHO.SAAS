import { useState } from "react";
import { Plus, ShoppingBag, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FrequentlyBoughtTogetherWidgetProps {
  mainProduct: {
    id: number;
    name: string;
    priceCents: number;
    imageUrl?: string;
  };
  onAddBundleToCart: (items: { productId: number; quantity: number }[]) => void;
}

export default function FrequentlyBoughtTogetherWidget({
  mainProduct,
  onAddBundleToCart,
}: FrequentlyBoughtTogetherWidgetProps) {
  const bundleQuery = trpc.frequentlyBoughtTogether.getForProduct.useQuery({
    mainProductId: mainProduct.id,
  });

  const bundle = bundleQuery.data;

  // Demo addon products if database query returns bundle
  const addons = [
    {
      id: 991,
      name: "Écharpe d'Hiver Douce & Chaude",
      priceCents: 2500, // 25 CHF
      imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300",
    },
    {
      id: 992,
      name: "Gants Cuir & Polaire",
      priceCents: 3500, // 35 CHF
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300",
    },
  ];

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([
    mainProduct.id,
    addons[0].id,
    addons[1].id,
  ]);

  if (!bundle || !bundle.enabled) {
    return null;
  }

  const allItems = [
    { id: mainProduct.id, name: mainProduct.name, priceCents: mainProduct.priceCents, imageUrl: mainProduct.imageUrl },
    ...addons,
  ];

  const selectedItems = allItems.filter((item) => selectedProductIds.includes(item.id));
  const totalOriginalCents = selectedItems.reduce((sum, item) => sum + item.priceCents, 0);

  const discountPct = bundle.discountPercentage || 10;
  const bundleDiscountCents = Math.round((totalOriginalCents * discountPct) / 100);
  const totalBundleCents = totalOriginalCents - bundleDiscountCents;

  const toggleSelect = (id: number) => {
    if (id === mainProduct.id) return; // Main product always selected
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 shadow-sm my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center justify-between text-slate-900">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            {bundle.title || "Fréquemment Achetés Ensemble"}
          </span>
          <Badge className="bg-emerald-600 text-white font-bold text-xs">
            -{discountPct}% sur le lot
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Images plus sign gallery */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {selectedItems.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white relative">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              {idx < selectedItems.length - 1 && (
                <Plus className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Checkboxes list */}
        <div className="space-y-2 text-xs">
          {allItems.map((item) => {
            const checked = selectedProductIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
                  checked ? "border-indigo-200 bg-indigo-50/40" : "border-slate-100 bg-white opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={checked} disabled={item.id === mainProduct.id} />
                  <span className="font-medium text-slate-800">
                    {item.name} {item.id === mainProduct.id && <span className="text-[10px] text-indigo-600 font-bold">(Ce produit)</span>}
                  </span>
                </div>
                <span className="font-bold text-slate-900">{(item.priceCents / 100).toFixed(2)} CHF</span>
              </div>
            );
          })}
        </div>

        {/* Total & CTA */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500 block">Prix total du lot :</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-indigo-700">{(totalBundleCents / 100).toFixed(2)} CHF</span>
              <span className="text-xs text-slate-400 line-through">{(totalOriginalCents / 100).toFixed(2)} CHF</span>
            </div>
          </div>

          <Button
            onClick={() => {
              onAddBundleToCart(selectedItems.map((i) => ({ productId: i.id, quantity: 1 })));
              toast.success("Lot ajouté au panier !");
            }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-5 px-6 gap-2 shadow"
          >
            <ShoppingBag className="w-4 h-4" />
            Ajouter le Lot au Panier (-{discountPct}%)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
