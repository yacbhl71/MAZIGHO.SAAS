import { useState, useEffect } from "react";
import { Play, Plus, Save, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { defaultShoppableStoriesConfig, type ShoppableStoriesConfig, type ShoppableStoryItem } from "@shared/shoppableVideoStories";

export default function OwnerShoppableStoriesManager() {
  const query = trpc.shoppableStories.getConfig.useQuery();
  const save = trpc.shoppableStories.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Stories Vidéo enregistrées !");
      query.refetch();
    },
    onError: err => toast.error(err.message || "Erreur d'enregistrement"),
  });

  const [form, setForm] = useState<ShoppableStoriesConfig>(defaultShoppableStoriesConfig);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const addStory = () => {
    const newStory: ShoppableStoryItem = {
      id: `story-${Date.now()}`,
      title: "Nouvelle Story",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      posterUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      productTitle: "Article Vedette",
      productPriceCents: 9900,
    };
    setForm(prev => ({ ...prev, stories: [...prev.stories, newStory] }));
  };

  const removeStory = (id: string) => {
    setForm(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }));
  };

  const updateStory = (id: string, field: keyof ShoppableStoryItem, value: any) => {
    setForm(prev => ({
      ...prev,
      stories: prev.stories.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  return (
    <Card className="border-rose-200 bg-rose-50/30 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-600 p-2.5 text-white">
              <Play className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-rose-950">Stories Vidéo Interactives ("Shoppable Stories")</CardTitle>
              <CardDescription className="mt-1">
                Affichez des bulles vidéo dynamiques au format Instagram sur votre vitrine pour présenter vos produits.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-rose-300 bg-white px-4 py-2">
            <Switch
              id="shoppable-toggle"
              checked={form.enabled}
              onCheckedChange={checked => setForm(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="shoppable-toggle" className="font-semibold text-rose-900 cursor-pointer">
              {form.enabled ? "Actif sur la boutique" : "Désactivé"}
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-semibold">Titre de la section sur la vitrine</Label>
          <Input
            value={form.sectionTitle}
            onChange={e => setForm(prev => ({ ...prev, sectionTitle: e.target.value }))}
            placeholder="Ex. Découvrir en Stories"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-rose-950">Liste des Stories Vidéo ({form.stories.length})</h3>
            <Button type="button" variant="outline" size="sm" onClick={addStory} className="border-rose-300 bg-white">
              <Plus className="mr-2 h-4 w-4" /> Ajouter une story
            </Button>
          </div>

          <div className="space-y-3">
            {form.stories.map((story, index) => (
              <div key={story.id} className="rounded-xl border border-rose-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Story #{index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStory(story.id)} className="text-rose-600 hover:bg-rose-50">
                    <Trash2 className="mr-1.5 h-4 w-4" /> Supprimer
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Titre de la story</Label>
                    <Input
                      value={story.title}
                      onChange={e => updateStory(story.id, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">URL de la vidéo (.mp4)</Label>
                    <Input
                      value={story.videoUrl}
                      onChange={e => updateStory(story.id, "videoUrl", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">URL Image d'aperçu / Poster</Label>
                    <Input
                      value={story.posterUrl}
                      onChange={e => updateStory(story.id, "posterUrl", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Nom du produit associé</Label>
                    <Input
                      value={story.productTitle || ""}
                      onChange={e => updateStory(story.id, "productTitle", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={() => save.mutate(form)}
            disabled={save.isPending}
            className="min-h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer les Stories Vidéo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
