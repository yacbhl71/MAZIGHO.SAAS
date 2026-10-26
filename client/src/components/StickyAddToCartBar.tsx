import { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

interface StickyAddToCartBarProps {
  product: {
    id: number;
    name: string;
    price: number | string;
    imageUrl?: string;
  };
  onAddToCart: () => void;
}

export default function StickyAddToCartBar({ product, onAddToCart }: StickyAddToCartBarProps) {
  const configQuery = trpc.stickyAddToCart.getConfig.useQuery();
  const config = configQuery.data;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down 250px
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!config || !config.enabled || !isVisible) {
    return null;
  }

  const priceNum = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;

  return (
    <div className="fixed z-40 bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {config.showPriceAndImage && product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 hidden sm:block"
            />
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{product.name}</h4>
            <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
              {priceNum.toFixed(2)} CHF
            </span>
          </div>
        </div>

        <Button
          onClick={onAddToCart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 gap-1.5 shadow shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          Ajouter au Panier
        </Button>
      </div>
    </div>
  );
}
