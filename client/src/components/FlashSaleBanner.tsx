import { useState, useEffect } from "react";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FlashSaleBanner() {
  const activeSaleQuery = trpc.flashSale.getActive.useQuery();
  const sale = activeSaleQuery.data;

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!sale) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(sale.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sale]);

  if (!sale || !sale.enabled || !sale.showBannerCountdown || !timeLeft) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 text-white px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Badge className="bg-white text-rose-700 font-black animate-pulse gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 fill-rose-600" />
            VENTE FLASH -{sale.discountPercentage}%
          </Badge>
          <span className="font-bold hidden md:inline">{sale.title}</span>
        </div>

        {/* Timer countdown */}
        <div className="flex items-center gap-3 font-mono">
          <span className="text-[11px] font-semibold flex items-center gap-1 opacity-90">
            <Clock className="w-3.5 h-3.5" />
            Temps restant :
          </span>
          <div className="flex items-center gap-1 font-bold text-sm">
            <span className="bg-black/30 px-2 py-0.5 rounded">{String(timeLeft.hours).padStart(2, "0")}h</span>
            <span>:</span>
            <span className="bg-black/30 px-2 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, "0")}m</span>
            <span>:</span>
            <span className="bg-black/30 px-2 py-0.5 rounded text-amber-300">{String(timeLeft.seconds).padStart(2, "0")}s</span>
          </div>
        </div>

        <Button
          size="xs"
          onClick={() => {
            const catalogueEl = document.getElementById("catalogue") || document.getElementById("featured");
            if (catalogueEl) {
              catalogueEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 text-[11px] gap-1"
        >
          En profiter
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
