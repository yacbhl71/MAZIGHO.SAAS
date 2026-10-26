import { useState } from "react";
import {
  ShoppingBag,
  Mail,
  RefreshCw,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Send,
  Target,
  Sparkles,
  BarChart3,
  Check,
  Copy,
  DollarSign,
  AlertCircle,
  Code2,
  Loader2,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  isValidGaMeasurementId,
  isValidGtmContainerId,
  isValidMetaPixelId,
  isValidTikTokPixelId,
  type AbandonedCart,
} from "@shared/abandonedCart";

function cleanPhoneNumber(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[\s.\-()]/g, "").replace(/^\+/, "");
}

function buildCartRecoveryMessage(cart: AbandonedCart, discountPercent: number, storeName: string = "notre boutique") {
  const discountCode = `RELANCE${discountPercent}`;
  const total = (cart.totalAmountCents / 100).toFixed(2);
  const itemsText = cart.items.map(i => `• ${i.quantity}x ${i.productName}`).join("\n");
  const greeting = cart.customerName ? `Bonjour ${cart.customerName}` : "Bonjour";

  const whatsappMessage = `${greeting} ! 👋\n\nVos articles vous attendent chez *${storeName}* :\n${itemsText}\n\n*Total : ${total} ${cart.currency}*\n\n🎁 Pour finaliser votre commande en toute sérénité, nous vous offrons *-${discountPercent}%* immédiats avec le code : *${discountCode}*.\n\nRetrouvez votre panier ici :\nhttps://studio.mazigho.com/panier?recovery=${cart.recoveryToken}&code=${discountCode}\n\nUne question ? Nous restons à votre entière disposition ! ✨`;

  const smsMessage = `${greeting}, vos articles chez ${storeName} vous attendent ! Profitez de -${discountPercent}% avec le code ${discountCode} pour finaliser votre commande : https://studio.mazigho.com/panier?recovery=${cart.recoveryToken}&code=${discountCode}`;

  return { whatsappMessage, smsMessage, discountCode };
}

export default function OwnerAbandonedCartAndPixels() {
  const [activeTab, setActiveTab] = useState("abandoned_carts");
  const utils = trpc.useUtils();

  // Dialog State for Recovery Reminder
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [reminderDiscount, setReminderDiscount] = useState<number>(10);
  const [reminderChannel, setReminderChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [manualPhone, setManualPhone] = useState<string>("");

  // Pixel Form State
  const pixelsQuery = trpc.abandonedCart.getPixelsConfig.useQuery();
  const [metaPixel, setMetaPixel] = useState("");
  const [tiktokPixel, setTiktokPixel] = useState("");
  const [gaId, setGaId] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [pixelsEnabled, setPixelsEnabled] = useState(true);
  const [isPixelsInitialized, setIsPixelsInitialized] = useState(false);

  // Sync pixel initial query data once loaded
  if (pixelsQuery.data && !isPixelsInitialized) {
    setMetaPixel(pixelsQuery.data.metaPixelId || "");
    setTiktokPixel(pixelsQuery.data.tiktokPixelId || "");
    setGaId(pixelsQuery.data.gaMeasurementId || "");
    setGtmId(pixelsQuery.data.gtmContainerId || "");
    setPixelsEnabled(pixelsQuery.data.enabled ?? true);
    setIsPixelsInitialized(true);
  }

  // Queries
  const cartsQuery = trpc.abandonedCart.getCarts.useQuery();
  const analyticsQuery = trpc.abandonedCart.getAnalytics.useQuery();

  // Mutations
  const sendReminderMutation = trpc.abandonedCart.sendReminder.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setSelectedCart(null);
      utils.abandonedCart.getCarts.invalidate();
      utils.abandonedCart.getAnalytics.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'envoi de la relance."),
  });

  const recordManualReminderMutation = trpc.abandonedCart.recordManualReminder.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.abandonedCart.getCarts.invalidate();
      utils.abandonedCart.getAnalytics.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'enregistrement de la relance."),
  });

  const markRecoveredMutation = trpc.abandonedCart.markRecovered.useMutation({
    onSuccess: () => {
      toast.success("Panier marqué comme récupéré !");
      utils.abandonedCart.getCarts.invalidate();
      utils.abandonedCart.getAnalytics.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur de mise à jour."),
  });

  const savePixelsMutation = trpc.abandonedCart.savePixelsConfig.useMutation({
    onSuccess: () => {
      toast.success("Configuration des Pixels enregistrée avec succès !");
      utils.abandonedCart.getPixelsConfig.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur d'enregistrement des pixels."),
  });

  const analytics = analyticsQuery.data;
  const carts = cartsQuery.data || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* BANNER HEADER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-100">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
              Conversion & Relance Ventes MAZIGHO
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Paniers Abandonnés & Tracking Pixels
            </h1>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
              Récupérez le chiffre d'affaires des visiteurs hésitants grâce aux e-mails de relance automatique et mesurez vos performances publicitaires avec les Pixels Meta, TikTok & Google.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div className="text-right">
              <p className="text-xs text-amber-200 uppercase font-semibold">Taux de Récupération</p>
              <p className="text-2xl sm:text-3xl font-black text-white">{analytics?.recoveryRatePercent || 0}%</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-200" />
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl grid grid-cols-2 gap-2 max-w-md">
          <TabsTrigger value="abandoned_carts" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            <span>Paniers Abandonnés</span>
          </TabsTrigger>
          <TabsTrigger value="tracking_pixels" className="rounded-lg gap-2 text-xs sm:text-sm font-medium py-2.5">
            <Target className="w-4 h-4 text-blue-500" />
            <span>Pixels & Tracking</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ABANDONED CARTS */}
        <TabsContent value="abandoned_carts" className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Chiffre d'Affaires Abandonné</p>
                  <p className="text-2xl font-extrabold text-orange-600 mt-1">
                    {((analytics?.totalAbandonedCents || 0) / 100).toFixed(2)} CHF
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Revenu Récupéré</p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {((analytics?.totalRecoveredCents || 0) / 100).toFixed(2)} CHF
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Paniers à Relancer</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {analytics?.totalCartsCount || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Taux de Conversion Relance</p>
                  <p className="text-2xl font-extrabold text-purple-600 mt-1">
                    {analytics?.recoveryRatePercent || 0}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CARTS TABLE */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  Paniers Non Finalisés
                </CardTitle>
                <CardDescription>
                  Consultez les paniers des clients hésitants et envoyez-leur une relance avec réduction en 1 clic.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  cartsQuery.refetch();
                  analyticsQuery.refetch();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              {carts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">Aucun panier abandonné récent</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Dès qu'un client enregistre son e-mail lors de la commande sans finaliser son paiement, son panier apparaîtra ici.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3">Client</th>
                        <th className="p-3">Articles</th>
                        <th className="p-3">Montant</th>
                        <th className="p-3">Date d'abandon</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {carts.map((cart) => (
                        <tr key={cart.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30">
                          <td className="p-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {cart.customerName || "Visiteur anonyme"}
                            </p>
                            <p className="text-xs text-slate-500">{cart.customerEmail}</p>
                            {cart.customerPhone && <p className="text-[11px] text-slate-400">{cart.customerPhone}</p>}
                          </td>
                          <td className="p-3 max-w-xs">
                            <ul className="space-y-1">
                              {cart.items.map((item, idx) => (
                                <li key={idx} className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {item.quantity}x {item.productName}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                            {(cart.totalAmountCents / 100).toFixed(2)} {cart.currency}
                          </td>
                          <td className="p-3 text-xs text-slate-500">
                            {new Date(cart.abandonedAt).toLocaleString("fr-CH", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3">
                            {cart.status === "recovered" ? (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none">
                                ✓ Récupéré
                              </Badge>
                            ) : cart.status === "reminded" ? (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-none">
                                Relancé ({cart.reminderCount}x)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-none">
                                Non relancé
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {cart.status !== "recovered" ? (
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                {cart.customerPhone && (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs h-8 px-2.5 shadow-sm"
                                    onClick={() => {
                                      setSelectedCart(cart);
                                      setReminderChannel("whatsapp");
                                      setManualPhone(cart.customerPhone || "");
                                    }}
                                    title="Relance WhatsApp 1-Clic"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    WhatsApp
                                  </Button>
                                )}
                                {cart.customerPhone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-sky-300 text-sky-800 hover:bg-sky-50 gap-1 text-xs h-8 px-2.5"
                                    onClick={() => {
                                      setSelectedCart(cart);
                                      setReminderChannel("sms");
                                      setManualPhone(cart.customerPhone || "");
                                    }}
                                    title="Relance SMS 1-Clic"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    SMS
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs h-8 px-2.5 shadow-sm"
                                  onClick={() => {
                                    setSelectedCart(cart);
                                    setReminderChannel("whatsapp");
                                    setManualPhone(cart.customerPhone || "");
                                  }}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Relancer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 px-2.5"
                                  onClick={() => markRecoveredMutation.mutate({ cartId: cart.id })}
                                >
                                  ✓ Récupéré
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600">Vente récupérée</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TRACKING PIXELS */}
        <TabsContent value="tracking_pixels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <Card className="lg:col-span-8 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Configuration des Pixels Publicitaires
                    </CardTitle>
                    <CardDescription>
                      Suivez le parcours d'achat de vos visiteurs sur vos campagnes Meta (Facebook/Instagram), TikTok & Google.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold">Pixels Actifs</Label>
                    <Switch checked={pixelsEnabled} onCheckedChange={setPixelsEnabled} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Pixel */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        f
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Meta Pixel (Facebook & Instagram)</p>
                        <p className="text-xs text-slate-500">ID à chiffres uniquement (ex: 123456789012345)</p>
                      </div>
                    </div>
                    {metaPixel && (
                      <Badge className={isValidMetaPixelId(metaPixel) ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                        {isValidMetaPixelId(metaPixel) ? "✓ Format Valide" : "Format Incorrect"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="ex: 987654321098765"
                    value={metaPixel}
                    onChange={(e) => setMetaPixel(e.target.value)}
                  />
                </div>

                {/* TikTok Pixel */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        TT
                      </div>
                      <div>
                        <p className="font-semibold text-sm">TikTok Pixel</p>
                        <p className="text-xs text-slate-500">ID de pixel TikTok (ex: C1234567890ABCDEFG)</p>
                      </div>
                    </div>
                    {tiktokPixel && (
                      <Badge className={isValidTikTokPixelId(tiktokPixel) ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                        {isValidTikTokPixelId(tiktokPixel) ? "✓ Format Valide" : "Format Incorrect"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="ex: C1234567890ABCDEFG"
                    value={tiktokPixel}
                    onChange={(e) => setTiktokPixel(e.target.value)}
                  />
                </div>

                {/* Google Analytics 4 */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                        GA4
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Google Analytics 4 (GA4)</p>
                        <p className="text-xs text-slate-500">ID de mesure commençant par G- (ex: G-ABC1234567)</p>
                      </div>
                    </div>
                    {gaId && (
                      <Badge className={isValidGaMeasurementId(gaId) ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                        {isValidGaMeasurementId(gaId) ? "✓ Format Valide" : "Format Incorrect (ex: G-XXXXX)"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="ex: G-XY12345678"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                  />
                </div>

                {/* Google Tag Manager */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                        GTM
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Google Tag Manager (GTM)</p>
                        <p className="text-xs text-slate-500">ID de conteneur commençant par GTM- (ex: GTM-ABC1234)</p>
                      </div>
                    </div>
                    {gtmId && (
                      <Badge className={isValidGtmContainerId(gtmId) ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                        {isValidGtmContainerId(gtmId) ? "✓ Format Valide" : "Format Incorrect (ex: GTM-XXXX)"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="ex: GTM-WXYZ123"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 gap-2"
                  disabled={savePixelsMutation.isPending}
                  onClick={() => {
                    savePixelsMutation.mutate({
                      metaPixelId: metaPixel || null,
                      tiktokPixelId: tiktokPixel || null,
                      gaMeasurementId: gaId || null,
                      gtmContainerId: gtmId || null,
                      enabled: pixelsEnabled,
                    });
                  }}
                >
                  {savePixelsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Enregistrer la Configuration Pixels
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    Événements Suivis Automatiquement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  <p>Une fois configurés, les pixels déclenchent automatiquement les événements e-commerce standard :</p>
                  <ul className="space-y-2 font-medium">
                    <li className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>PageView</strong> : Navigation sur les pages
                    </li>
                    <li className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>ViewContent</strong> : Consultation d'une fiche produit
                    </li>
                    <li className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>AddToCart</strong> : Clic "Ajouter au panier"
                    </li>
                    <li className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>InitiateCheckout</strong> : Ouverture du tunnel de commande
                    </li>
                    <li className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>Purchase</strong> : Validation & paiement confirmé
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG FOR RELANCE REMINDER (WHATSAPP, SMS, EMAIL) */}
      <Dialog open={Boolean(selectedCart)} onOpenChange={(o) => !o && setSelectedCart(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Send className="w-5 h-5 text-orange-600" />
              Relancer le Panier · {selectedCart?.customerName || selectedCart?.customerEmail}
            </DialogTitle>
            <DialogDescription>
              Choisissez le canal de communication le plus efficace (WhatsApp & SMS ont un taux d'ouverture supérieur à 90%).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* CHANNEL SELECTOR BUTTONS */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setReminderChannel("whatsapp")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  reminderChannel === "whatsapp"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp (1-Clic)
              </button>
              <button
                type="button"
                onClick={() => setReminderChannel("sms")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  reminderChannel === "sms"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                SMS Direct
              </button>
              <button
                type="button"
                onClick={() => setReminderChannel("email")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  reminderChannel === "email"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Mail className="w-4 h-4" />
                E-mail
              </button>
            </div>

            {/* DISCOUNT SELECTOR */}
            <div>
              <Label className="text-xs font-semibold">Réduction Incitative Offerte</Label>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {[5, 10, 15, 20].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant={reminderDiscount === pct ? "default" : "outline"}
                    className={
                      reminderDiscount === pct
                        ? reminderChannel === "whatsapp"
                          ? "bg-emerald-600 text-white"
                          : reminderChannel === "sms"
                          ? "bg-sky-600 text-white"
                          : "bg-orange-600 text-white"
                        : ""
                    }
                    size="sm"
                    onClick={() => setReminderDiscount(pct)}
                  >
                    -{pct}% (RELANCE{pct})
                  </Button>
                ))}
              </div>
            </div>

            {/* PHONE INPUT FOR WHATSAPP & SMS */}
            {(reminderChannel === "whatsapp" || reminderChannel === "sms") && (
              <div className="space-y-1.5">
                <Label htmlFor="manual-phone-input" className="text-xs font-semibold flex items-center justify-between">
                  <span>Numéro de téléphone du destinataire</span>
                  <span className="text-[11px] text-slate-500 font-normal">Format international (ex: +41 79... ou +213 6...)</span>
                </Label>
                <Input
                  id="manual-phone-input"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="ex: +41 79 123 45 67 ou 06 12 34 56 78"
                  className="text-xs"
                />
              </div>
            )}

            {/* CHANNEL PREVIEWS */}
            {selectedCart && (
              <>
                {reminderChannel === "whatsapp" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        Aperçu du message WhatsApp
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-800 hover:bg-emerald-100"
                        onClick={() => {
                          const { whatsappMessage } = buildCartRecoveryMessage(selectedCart, reminderDiscount);
                          navigator.clipboard.writeText(whatsappMessage);
                          toast.success("Texte WhatsApp copié dans le presse-papiers !");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copier
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-emerald-100 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed shadow-sm">
                      {buildCartRecoveryMessage(selectedCart, reminderDiscount).whatsappMessage}
                    </div>
                  </div>
                )}

                {reminderChannel === "sms" && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-sky-600" />
                        Aperçu du SMS
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-sky-800 hover:bg-sky-100"
                        onClick={() => {
                          const { smsMessage } = buildCartRecoveryMessage(selectedCart, reminderDiscount);
                          navigator.clipboard.writeText(smsMessage);
                          toast.success("Texte SMS copié dans le presse-papiers !");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copier
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-sky-100 text-xs text-slate-800 font-sans leading-relaxed shadow-sm">
                      {buildCartRecoveryMessage(selectedCart, reminderDiscount).smsMessage}
                    </div>
                  </div>
                )}

                {reminderChannel === "email" && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1.5 border">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Destinataire e-mail : <span className="text-orange-600 font-mono">{selectedCart.customerEmail}</span>
                    </p>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                      {selectedCart.items.map((it, idx) => (
                        <li key={idx}>
                          {it.quantity}x {it.productName} ({(it.priceCents / 100).toFixed(2)} {selectedCart.currency})
                        </li>
                      ))}
                    </ul>
                    <p className="font-bold text-slate-900 dark:text-slate-100 pt-1">
                      Montant total : {((selectedCart.totalAmountCents || 0) / 100).toFixed(2)} {selectedCart.currency}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedCart(null)}>
              Fermer
            </Button>

            {reminderChannel === "whatsapp" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                disabled={recordManualReminderMutation.isPending}
                onClick={() => {
                  if (selectedCart) {
                    const phone = cleanPhoneNumber(manualPhone || selectedCart.customerPhone);
                    if (!phone) {
                      toast.error("Veuillez renseigner un numéro de téléphone avant d'ouvrir WhatsApp.");
                      return;
                    }
                    const { whatsappMessage } = buildCartRecoveryMessage(selectedCart, reminderDiscount);
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                    recordManualReminderMutation.mutate({
                      cartId: selectedCart.id,
                      channel: "whatsapp",
                      discountPercent: reminderDiscount,
                    });
                    setSelectedCart(null);
                  }
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Ouvrir WhatsApp Web / Application
              </Button>
            )}

            {reminderChannel === "sms" && (
              <Button
                className="bg-sky-600 hover:bg-sky-700 text-white gap-2 font-semibold"
                disabled={recordManualReminderMutation.isPending}
                onClick={() => {
                  if (selectedCart) {
                    const phone = cleanPhoneNumber(manualPhone || selectedCart.customerPhone);
                    if (!phone) {
                      toast.error("Veuillez renseigner un numéro de téléphone pour envoyer un SMS.");
                      return;
                    }
                    const { smsMessage } = buildCartRecoveryMessage(selectedCart, reminderDiscount);
                    const url = `sms:${phone}?body=${encodeURIComponent(smsMessage)}`;
                    window.open(url, "_self");
                    recordManualReminderMutation.mutate({
                      cartId: selectedCart.id,
                      channel: "sms",
                      discountPercent: reminderDiscount,
                    });
                    setSelectedCart(null);
                  }
                }}
              >
                <MessageSquare className="w-4 h-4" />
                Ouvrir SMS
              </Button>
            )}

            {reminderChannel === "email" && (
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 font-semibold"
                disabled={sendReminderMutation.isPending}
                onClick={() => {
                  if (selectedCart) {
                    sendReminderMutation.mutate({
                      cartId: selectedCart.id,
                      discountPercent: reminderDiscount,
                    });
                  }
                }}
              >
                {sendReminderMutation.isPending ? "Envoi..." : `Envoyer E-mail (-${reminderDiscount}%)`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
