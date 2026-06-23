import { useState } from "react";
import { findVerse, getAllCategories, type VerseResult } from "@/lib/verse-engine";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, HeartOff } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { VerseShareButtons } from "@/components/verse-share-buttons";

export default function Categories() {
  const categories = getAllCategories();
  const [activeVerse, setActiveVerse] = useState<VerseResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const handleCategoryClick = (label: string) => {
    setActiveVerse(findVerse(label));
    setDialogOpen(true);
  };

  const toggleFavorite = () => {
    if (!activeVerse) return;
    if (isFavorite(activeVerse.verse_reference)) {
      removeFavorite(activeVerse.verse_reference);
    } else {
      addFavorite(activeVerse);
    }
  };

  const saved = activeVerse ? isFavorite(activeVerse.verse_reference) : false;

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-700">
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-3xl font-serif text-foreground">Temas de Consuelo</h2>
        <p className="text-muted-foreground font-serif text-xl leading-relaxed">
          Elige un tema y recibirás un versículo que habla a esa necesidad.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.label)}
            className="text-left group relative overflow-hidden bg-card hover:bg-primary/5 border border-border/50 hover:border-primary/30 rounded-2xl p-7 transition-all duration-300 hover:shadow-sm"
            data-testid={`button-category-${cat.id}`}
          >
            <div className="flex justify-between items-center gap-3">
              <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">
                {cat.label}
              </h3>
              <span className="text-base font-medium text-muted-foreground bg-background px-4 py-1.5 rounded-full border border-border/50 whitespace-nowrap">
                {cat.count} versículos
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="cuadro max-w-2xl border-primary/20 sm:rounded-3xl p-0 overflow-hidden">
          <div className="p-8 md:p-12 text-center bg-gradient-to-b from-card to-background">
            {activeVerse && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-base font-medium tracking-wide uppercase mb-6">
                  {activeVerse.detected_category}
                </span>

                <p
                  className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed mb-8"
                  data-testid="modal-verse-text"
                >
                  "{activeVerse.verse_text}"
                </p>

                <div className="pt-6 border-t border-border/50 flex flex-col items-center gap-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                    <span
                      className="font-serif text-2xl text-primary font-medium"
                      data-testid="modal-verse-reference"
                    >
                      {activeVerse.verse_reference}
                    </span>
                    <Button
                      variant={saved ? "default" : "outline"}
                      size="lg"
                      onClick={toggleFavorite}
                      className="rounded-full h-12 px-7 text-lg font-serif gap-2"
                    >
                      {saved ? (
                        <>
                          <HeartOff className="h-5 w-5" />
                          Guardado
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5" />
                          Guardar en favoritos
                        </>
                      )}
                    </Button>
                  </div>
                  <VerseShareButtons verse={activeVerse} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
