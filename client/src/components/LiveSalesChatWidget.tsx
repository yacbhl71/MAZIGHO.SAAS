import { useState } from "react";
import { MessageCircle, Send, X, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function LiveSalesChatWidget() {
  const configQuery = trpc.liveSalesChat.getConfig.useQuery();
  const config = configQuery.data;

  const [isOpen, setIsOpen] = useState(false);

  if (!config || !config.enabled || !config.whatsappNumber) {
    return null;
  }

  const sanitizedNumber = config.whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent("Bonjour, j'ai une question concernant un produit sur votre boutique.")}`;

  return (
    <div
      className={`fixed z-50 bottom-5 ${
        config.position === "bottom-left" ? "left-5" : "right-5"
      }`}
    >
      {/* Popover Message */}
      {isOpen && (
        <div className="mb-3 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Support Client Direct</span>
            </div>
            <Button size="xs" variant="ghost" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {config.welcomeMessage}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            Discuter sur WhatsApp
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </button>
    </div>
  );
}
