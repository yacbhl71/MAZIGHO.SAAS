import { useState } from "react";
import { Star, CheckCircle2, MessageSquare, Image, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ProductReviewsWidgetProps {
  productId: number;
  productTitle?: string;
}

export default function ProductReviewsWidget({
  productId,
  productTitle = "Ce produit",
}: ProductReviewsWidgetProps) {
  const utils = trpc.useUtils();
  const reviewsQuery = trpc.productReviewsUgc.getPublicReviews.useQuery({ productId });
  const configQuery = trpc.productReviewsUgc.getConfig.useQuery();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");

  const submitMutation = trpc.productReviewsUgc.submitReview.useMutation({
    onSuccess: (res) => {
      if (res.status === "APPROVED") {
        toast.success("Votre avis a été publié ! Merci pour votre retour.");
      } else {
        toast.success("Merci ! Votre avis est transmis au commerçant pour modération.");
      }
      setIsFormOpen(false);
      setComment("");
      setTitle("");
      utils.productReviewsUgc.getPublicReviews.invalidate({ productId });
    },
    onError: (err) => toast.error(err.message || "Erreur lors de l'envoi de l'avis."),
  });

  if (configQuery.data && !configQuery.data.enabled) {
    return null;
  }

  const { reviews, averageRating, totalReviews } = reviewsQuery.data || {
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm mt-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Avis Clients ({totalReviews})
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Découvrez les retours et photos partagés par nos acheteurs certifiés.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400"> / 5</span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {isFormOpen ? "Fermer" : "Donner mon avis"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Form */}
        {isFormOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate({
                productId,
                productTitle,
                authorName,
                authorEmail,
                rating,
                title,
                comment,
                mediaUrls: mediaUrlInput ? [mediaUrlInput] : [],
                verifiedBuyer: true,
              });
            }}
            className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3 text-xs"
          >
            <h4 className="font-bold text-indigo-950 text-sm">Partager votre expérience</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rev-author" className="text-xs font-semibold">Votre Prénom / Nom</Label>
                <Input
                  id="rev-author"
                  placeholder="ex: Marc D."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="mt-1 text-xs bg-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rev-email" className="text-xs font-semibold">Votre E-mail (Achat Vérifié)</Label>
                <Input
                  id="rev-email"
                  type="email"
                  placeholder="ex: marc@example.com"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="mt-1 text-xs bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold block mb-1">Note globale</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="rev-comment" className="text-xs font-semibold">Votre Avis</Label>
              <Textarea
                id="rev-comment"
                placeholder="Racontez votre expérience avec ce produit..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 text-xs bg-white h-20"
                required
              />
            </div>

            <div>
              <Label htmlFor="rev-media" className="text-xs font-semibold">Lien Photo du produit (optionnel)</Label>
              <Input
                id="rev-media"
                placeholder="https://..."
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                className="mt-1 text-xs bg-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5 py-4"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Soumettre l'avis
            </Button>
          </form>
        )}

        {/* Reviews List */}
        {reviewsQuery.isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des avis...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <p className="text-xs font-medium">Aucun avis publié pour le moment.</p>
            <p className="text-[11px]">Soyez le premier à donner votre avis sur {productTitle} !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.authorName}</span>
                    {rev.verifiedBuyer && (
                      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-[10px] gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Achat Vérifié
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-slate-700 leading-relaxed">{rev.comment}</p>

                {rev.mediaUrls && rev.mediaUrls.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {rev.mediaUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Photo client"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                )}

                {rev.merchantReply && (
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-950 mt-2">
                    <strong className="block text-[10px] text-indigo-800">Réponse du Vendeur :</strong>
                    <p className="text-xs mt-0.5">{rev.merchantReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
