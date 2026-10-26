import { ShoppingBag, Truck, CheckCircle2, ArrowRight, X, Plus, Minus, Trash2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export interface CartItem {
  productId: number;
  title: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
}

interface SlideOutCartDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export default function SlideOutCartDrawer({
  isOpen,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: SlideOutCartDrawerProps) {
  const configQuery = trpc.slideOutCart.getConfig.useQuery();
  const config = configQuery.data;

  if (config && !config.enabled) {
    return null;
  }

  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const thresholdCents = config?.freeShippingThresholdCents || 10000;
  const progressPct = Math.min(100, Math.round((subtotalCents / thresholdCents) * 100));
  const remainingCents = Math.max(0, thresholdCents - subtotalCents);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <SheetTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Mon Panier ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {/* Dynamic Free Shipping Bar */}
        {config?.freeShippingGoalEnabled && (
          <div className="p-3.5 bg-indigo-50/70 border-b border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200">
                <Truck className="w-4 h-4 text-indigo-600" />
                {remainingCents === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Livraison Offerte débloquée !
                  </span>
                ) : (
                  <>
                    Plus que <strong className="text-indigo-700">{(remainingCents / 100).toFixed(2)} CHF</strong> pour la livraison offerte
                  </>
                )}
              </span>
              <span className="text-[11px] text-indigo-700">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-indigo-200/50 dark:bg-indigo-900/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-medium">Votre panier est vide pour le moment.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</h4>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {((item.priceCents * item.quantity) / 100).toFixed(2)} CHF
                  </span>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border border-slate-300 rounded-md bg-white dark:bg-slate-900">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="h-6 w-6 p-0 text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="px-2 text-xs font-bold">{item.quantity}</span>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="h-6 w-6 p-0 text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveItem(item.productId)}
                  className="h-7 w-7 text-slate-400 hover:text-rose-600 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Sous-total</span>
              <span className="font-black text-slate-900 dark:text-slate-100 text-base">
                {(subtotalCents / 100).toFixed(2)} CHF
              </span>
            </div>

            <Button
              onClick={onCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 gap-2 text-sm shadow-md"
            >
              Commander Maintenant
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
