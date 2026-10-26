import { useState } from "react";
import { Bell, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BackInStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productTitle: string;
}

export default function BackInStockDialog({
  isOpen,
  onOpenChange,
  productId,
  productTitle,
}: BackInStockDialogProps) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = trpc.backInStock.subscribe.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Alerte de réassort enregistrée !");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'inscription."),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500 fill-amber-500" />
            Alerte Retour en Stock
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">C'est noté !</h4>
            <p className="text-xs text-slate-600">
              Nous vous enverrons un e-mail dès que <strong>{productTitle}</strong> sera de nouveau disponible.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setIsSuccess(false);
                onOpenChange(false);
              }}
              className="mt-2 text-xs bg-slate-900 text-white"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customerEmail) {
                subscribeMutation.mutate({
                  productId,
                  productTitle,
                  customerEmail,
                });
              }
            }}
            className="space-y-4 py-2 text-xs"
          >
            <p className="text-slate-600">
              L'article <strong>{productTitle}</strong> est actuellement épuisé. Laissez-nous votre e-mail pour être prévenu en priorité lors du prochain arrivage !
            </p>

            <div>
              <Label htmlFor="bis-email" className="text-xs font-semibold">Votre adresse e-mail</Label>
              <Input
                id="bis-email"
                type="email"
                placeholder="votre@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1 text-xs"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 py-4"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Me Prévenir par E-mail
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
