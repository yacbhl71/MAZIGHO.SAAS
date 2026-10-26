import { useState } from "react";
import { FileText, Printer, Download, Eye, Loader2, QrCode } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OwnerSwissInvoiceDialogProps {
  orderId: number | null;
  onOpenChange: (orderId: number | null) => void;
}

export default function OwnerSwissInvoiceDialog({ orderId, onOpenChange }: OwnerSwissInvoiceDialogProps) {
  const invoiceQuery = trpc.swissQrBill.generateInvoiceData.useQuery(
    { orderId: orderId || 0 },
    { enabled: orderId !== null, retry: false, refetchOnWindowFocus: false }
  );

  const printInvoice = () => {
    if (!invoiceQuery.data?.html) return;
    const printableWindow = window.open("", "_blank", "popup=yes,width=900,height=900");
    if (!printableWindow) return;
    printableWindow.opener = null;
    printableWindow.document.write(invoiceQuery.data.html);
    printableWindow.document.close();
    printableWindow.focus();
    printableWindow.print();
  };

  return (
    <Dialog open={orderId !== null} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <QrCode className="w-5 h-5 text-orange-600" />
            Facture & QR-Facture Suisse SIX · Commande #{orderId ?? "—"}
          </DialogTitle>
          <DialogDescription>
            Facture officielle conforme aux normes suisses avec bulletin de versement QR-Code SIX Interbank Clearing.
          </DialogDescription>
        </DialogHeader>

        {invoiceQuery.isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <p className="text-sm font-medium">Génération de la facture et du QR-Code suisse...</p>
          </div>
        ) : invoiceQuery.data ? (
          <div className="space-y-4">
            <div className="border rounded-xl p-4 bg-slate-50 max-h-[55vh] overflow-y-auto shadow-inner">
              <iframe
                title="Aperçu Facture Suisse"
                srcDoc={invoiceQuery.data.html}
                className="w-full min-h-[500px] border-none rounded bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
              <p>
                <strong>E-Banking & TWINT :</strong> Le QR-Code est prêt à être scanné par les applications bancaires suisses.
              </p>
              <Button onClick={printInvoice} className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-semibold">
                <Printer className="w-4 h-4" />
                Imprimer / Télécharger en PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            Impossible de charger les données de la facture.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
