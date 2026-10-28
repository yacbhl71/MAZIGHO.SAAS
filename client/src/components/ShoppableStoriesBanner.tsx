import { useState } from "react";
import { Play, ShoppingBag, Volume2, VolumeX, X, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import type { ShoppableStoryItem } from "@shared/shoppableVideoStories";

export default function ShoppableStoriesBanner() {
  const configQuery = trpc.shoppableStories.getConfig.useQuery();
  const config = configQuery.data;

  const [selectedStory, setSelectedStory] = useState<ShoppableStoryItem | null>(null);
  const [muted, setMuted] = useState(true);

  if (!config?.enabled || !config.stories.length) return null;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6" data-testid="shoppable-stories-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" /> {config.sectionTitle}
          </h2>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Vidéos Interactives
          </span>
        </div>

        {/* Scrollable Story circles */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {config.stories.map(story => (
            <button
              key={story.id}
              type="button"
              onClick={() => setSelectedStory(story)}
              className="group flex flex-col items-center gap-1.5 shrink-0 transition hover:scale-105"
            >
              <div className="relative grid h-20 w-20 place-items-center rounded-full border-2 border-rose-500 p-0.5 shadow-md ring-2 ring-rose-300/50">
                <img
                  src={story.posterUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"}
                  alt={story.title}
                  className="h-full w-full rounded-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/20 group-hover:bg-slate-950/40 transition">
                  <Play className="h-6 w-6 text-white fill-white drop-shadow-md" />
                </div>
              </div>
              <span className="max-w-[84px] truncate text-center text-xs font-semibold text-slate-800">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Full-screen Vertical Video Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="relative flex h-[82vh] max-h-[720px] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Top Bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/80 to-transparent">
              <span className="font-bold text-sm text-white drop-shadow">{selectedStory.title}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  className="rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStory(null)}
                  className="rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <video
              src={selectedStory.videoUrl}
              poster={selectedStory.posterUrl}
              autoPlay
              loop
              muted={muted}
              playsInline
              className="h-full w-full object-cover"
            />

            {/* Floating Product Card Tag */}
            {selectedStory.productTitle && (
              <div className="absolute bottom-4 inset-x-4 z-20 rounded-2xl border border-white/20 bg-slate-900/90 p-3 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-white">
                    <img
                      src={selectedStory.posterUrl}
                      alt={selectedStory.productTitle}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate">{selectedStory.productTitle}</p>
                    {selectedStory.productPriceCents && (
                      <p className="text-xs font-semibold text-rose-400">
                        {(selectedStory.productPriceCents / 100).toFixed(2)} CHF
                      </p>
                    )}
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0"
                  >
                    <a href="/boutique">
                      <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Voir
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
