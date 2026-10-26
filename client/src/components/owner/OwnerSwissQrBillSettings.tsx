import { useState } from "react";
import { QrCode, Building2, Check, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isValidSwissIban, formatSwissIban } from "@shared/swissQrBillInvoice";

export default function OwnerSwissQrBillSettings() {
  const utils = trpc.useUtils();
  const creditorQuery = trpc.swissQrBill.getCreditorConfig.useQuery();

  const [iban, setIban] = useState("");
  const [creditorName, setCreditorName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  if (creditorQuery.data && !isInitialized) {
    setIban(creditorQuery.data.iban || "");
    setCreditorName(creditorQuery.data.creditorName || "");
    setStreet(creditorQuery.data.creditorStreet || "");
    setPostalCode(creditorQuery.data.creditorPostalCode || "");
    setCity(creditorQuery.data.creditorCity || "");
    setVatNumber(creditorQuery.data.vatNumber || "");
    setEnabled(creditorQuery.data.enabled ?? true);
    setIsInitialized(true);
  }

  const saveConfigMutation = trpc.swissQrBill.saveCreditorConfig.useMutation({
    onSuccess: () => {
      toast.success("Coordonnées QR-Facture Suisse enregistrées !");
      utils.swissQrBill.getCreditorConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur d'enregistrement."),
  });

  const cleanIban = iban.replace(/\s+/g, "").toUpperCase();
  const isValidIban = isValidSwissIban(cleanIban);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              Configuration QR-Facture Suisse (SIX Interbank Clearing)
            </CardTitle>
            <CardDescription>
              Renseignez votre IBAN suisse et vos coordonnées de créancier pour générer les bulletins de versement avec QR-Code.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">QR-Facture Active</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="qr-iban" className="text-xs font-semibold">Numéro IBAN Suisse (CH ou LI) *</Label>
            {iban && (
              <Badge className={isValidIban ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                {isValidIban ? "✓ IBAN Valide" : "IBAN Invalide"}
              </Badge>
            )}
          </div>
          <Input
            id="qr-iban"
            placeholder="ex: CH56 3000 0000 0000 0000 0"
            value={iban}
            onChange={(e) => setIban(formatSwissIban(e.target.value))}
            className="mt-1 font-mono uppercase"
          />
        </div>

        <div>
          <Label htmlFor="qr-name" className="text-xs font-semibold">Nom de l'entreprise ou créancier *</Label>
          <Input
            id="qr-name"
            placeholder="ex: MAZIGHO E-commerce Sàrl"
            value={creditorName}
            onChange={(e) => setCreditorName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Label htmlFor="qr-street" className="text-xs font-semibold">Rue & Numéro *</Label>
            <Input
              id="qr-street"
              placeholder="ex: Rue du Rhône 42"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="qr-npa" className="text-xs font-semibold">Code Postal (NPA) *</Label>
            <Input
              id="qr-npa"
              placeholder="ex: 1204"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="qr-city" className="text-xs font-semibold">Ville *</Label>
            <Input
              id="qr-city"
              placeholder="ex: Genève"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="qr-vat" className="text-xs font-semibold">Numéro IDE / TVA (Optionnel)</Label>
          <Input
            id="qr-vat"
            placeholder="ex: CHE-123.456.789 TVA"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5 gap-2"
          disabled={!isValidIban || !creditorName || saveConfigMutation.isPending}
          onClick={() => {
            saveConfigMutation.mutate({
              iban,
              creditorName,
              creditorStreet: street,
              creditorPostalCode: postalCode,
              creditorCity: city,
              vatNumber,
              enabled,
            });
          }}
        >
          {saveConfigMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Enregistrer la Configuration QR-Facture
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
