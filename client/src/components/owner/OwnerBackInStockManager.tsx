import { Bell, Send, CheckCircle2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OwnerBackInStockManager() {
  const utils = trpc.useUtils();
  const subscriptionsQuery = trpc.backInStock.getSubscriptions.useQuery();

  const notifyMutation = trpc.backInStock.triggerNotification.useMutation({
    onSuccess: (res) => {
      toast.success(`${res.notifiedCount} alerte(s) email envoyée(s) aux clients !`);
      utils.backInStock.getSubscriptions.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'envoi."),
  });

  // Group subscriptions by productId
  const grouped = new Map<number, { productTitle: string; count: number; notifiedCount: number }>();

  if (subscriptionsQuery.data) {
    for (const sub of subscriptionsQuery.data) {
      const existing = grouped.get(sub.productId) || {
        productTitle: sub.productTitle,
        count: 0,
        notifiedCount: 0,
      };
      existing.count++;
      if (sub.notified) existing.notifiedCount++;
      grouped.set(sub.productId, existing);
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500 fill-amber-500" />
              Alertes Réassort & Listes d'Attente ("Back in Stock")
            </CardTitle>
            <CardDescription>
              Affichez la demande en attente pour vos produits en rupture et prévenez automatiquement vos clients d'un clic lors du réassort.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {subscriptionsQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des listes d'attente...
          </div>
        ) : Array.from(grouped.entries()).length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucune inscription en attente de réassort pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(grouped.entries()).map(([productId, info]) => (
              <div
                key={productId}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{info.productTitle}</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 font-bold text-xs gap-1">
                      <Users className="w-3 h-3" /> {info.count} client(s) en attente
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    ID Produit: #{productId} | Notifications déjà envoyées: {info.notifiedCount}
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={notifyMutation.isPending || info.count === info.notifiedCount}
                  onClick={() => notifyMutation.mutate({ productId })}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shrink-0"
                >
                  {notifyMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Avertir les Clients (Réassort Fait)
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
