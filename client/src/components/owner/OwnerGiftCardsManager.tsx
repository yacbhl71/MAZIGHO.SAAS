import { useState } from "react";
import { Gift, Plus, Copy, Check, Send, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function OwnerGiftCardsManager() {
  const utils = trpc.useUtils();
  const cardsQuery = trpc.digitalGiftCards.getStoreCards.useQuery();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initialBalanceChf, setInitialBalanceChf] = useState<number>(50);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const createMutation = trpc.digitalGiftCards.createCard.useMutation({
    onSuccess: (card) => {
      toast.success(`Carte-cadeau ${card.code} créée avec succès !`);
      setIsDialogOpen(false);
      utils.digitalGiftCards.getStoreCards.invalidate();
      // Reset
      setRecipientEmail("");
      setMessage("");
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la création."),
  });

  const cards = cardsQuery.data || [];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              Cartes-Cadeaux Numériques & Bons d'Achat ("Shopify Gift Cards")
            </CardTitle>
            <CardDescription>
              Émettez et gérez des cartes-cadeaux virtuelles utilisables au checkout par vos clients.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Émettre une Carte-Cadeau
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {cardsQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des cartes-cadeaux...
          </div>
        ) : cards.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Gift className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium">Aucune carte-cadeau émise pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{card.code}</span>
                    <Badge variant="outline" className={card.status === "ACTIVE" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600"}>
                      {card.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Solde restant : <strong className="text-indigo-600">{(card.remainingBalanceCents / 100).toFixed(2)} CHF</strong> / {(card.initialBalanceCents / 100).toFixed(2)} CHF
                  </p>
                  {card.recipientEmail && (
                    <p className="text-[11px] text-slate-500">Destinataire: {card.recipientEmail}</p>
                  )}
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(card.code);
                    setCopiedCode(card.code);
                    toast.success("Code copié !");
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="text-xs gap-1 shrink-0"
                >
                  {copiedCode === card.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === card.code ? "Copié !" : "Copier le Code"}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Modal de création */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Gift className="w-4 h-4 text-indigo-600" />
                Émettre une Carte-Cadeau
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  initialBalanceCents: Math.round(initialBalanceChf * 100),
                  recipientEmail: recipientEmail || undefined,
                  senderName: senderName || undefined,
                  message: message || undefined,
                });
              }}
              className="space-y-3 py-2 text-xs"
            >
              <div>
                <Label htmlFor="card-val" className="text-xs font-semibold">Montant initial (CHF)</Label>
                <Input
                  id="card-val"
                  type="number"
                  min={5}
                  value={initialBalanceChf}
                  onChange={(e) => setInitialBalanceChf(parseFloat(e.target.value) || 50)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="card-email" className="text-xs font-semibold">E-mail Destinataire (optionnel)</Label>
                <Input
                  id="card-email"
                  type="email"
                  placeholder="destinataire@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="card-sender" className="text-xs font-semibold">Nom de l'expéditeur (optionnel)</Label>
                <Input
                  id="card-sender"
                  placeholder="ex: L'équipe Boutique"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="card-msg" className="text-xs font-semibold">Message personnalisé</Label>
                <Textarea
                  id="card-msg"
                  placeholder="ex: Joyeux anniversaire de la part de toute l'équipe !"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 text-xs h-16"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)} className="text-xs">
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                >
                  {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                  Générer la Carte-Cadeau
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
