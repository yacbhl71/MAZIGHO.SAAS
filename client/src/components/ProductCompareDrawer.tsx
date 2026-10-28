import { useState, useEffect } from "react";
import { Scale, X, ShoppingBag, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProductCompareDrawer() {
  const configQuery = trpc.productCompare.getConfig.useQuery();
  const config = configQuery.data;

  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Listen to global compare toggle events
    const handleCompareEvent = (e: CustomEvent) => {
      const product = e.detail;
      setCompareItems(prev => {
        const exists = prev.some(item => item.id === product.id);
        if (exists) {
          toast.info(`${product.name} retiré du comparateur.`);
          return prev.filter(item => item.id !== product.id);
        }
        if (prev.length >= (config?.maxItems || 4)) {
          toast.warning(`Vous pouvez comparer jusqu'à ${config?.maxItems || 4} produits simultanément.`);
          return prev;
        }
        toast.success(`${product.name} ajouté au comparateur !`);
        return [...prev, product];
      });
    };

    window.addEventListener("mazigho_compare_product" as any, handleCompareEvent as any);
    return () => window.removeEventListener("mazigho_compare_product" as any, handleCompareEvent as any);
  }, [config?.maxItems]);

  if (!config?.enabled || compareItems.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border border-sky-300 bg-slate-900 px-5 py-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-sky-400" />
          <span className="font-bold text-sm">
            {compareItems.length} produit{compareItems.length > 1 ? "s" : ""} sélectionné{compareItems.length > 1 ? "s" : ""}
          </span>
        </div>
        <Button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold size-sm"
        >
          Comparer côte à côte
        </Button>
        <button
          type="button"
          onClick={() => setCompareItems([])}
          className="rounded-full p-1 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comparison Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl border-slate-200 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Scale className="h-6 w-6 text-sky-600" /> Tableau Comparatif des Produits
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 font-semibold text-slate-500 w-36">Caractéristiques</th>
                  {compareItems.map(item => (
                    <th key={item.id} className="p-3 text-center min-w-[180px]">
                      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl border bg-slate-50 p-1 mb-2">
                        <img
                          src={item.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="font-bold text-slate-900 line-clamp-2">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => setCompareItems(prev => prev.filter(i => i.id !== item.id))}
                        className="mt-1 inline-flex items-center text-xs text-rose-600 hover:underline"
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Retirer
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-slate-800">
                <tr>
                  <td className="p-3 font-semibold text-slate-500">Prix</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="p-3 text-center font-extrabold text-sky-600">
                      {(item.price / 100).toFixed(2)} CHF
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-500">Disponibilité</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="p-3 text-center">
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> En Stock
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-500">Catégorie</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="p-3 text-center text-xs text-slate-600">
                      {item.categoryName || "Gamme Générale"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-500">Description</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="p-3 text-center text-xs text-slate-600 line-clamp-3">
                      {item.description || "Aucune spécification."}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
