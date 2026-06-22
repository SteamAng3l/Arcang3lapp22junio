import { useFavorites } from "@/hooks/use-favorites";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, BookHeart } from "lucide-react";

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-700">
        <BookHeart className="h-16 w-16 text-primary/30" />
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-serif text-foreground">Mis Favoritos</h2>
          <p className="text-muted-foreground font-serif text-xl leading-relaxed max-w-sm mx-auto">
            Aún no has guardado ningún versículo. Cuando encuentres uno que te toque el corazón, pulsa "Guardar en favoritos".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-serif text-foreground">Mis Favoritos</h2>
        <p className="text-muted-foreground font-serif text-xl">
          {favorites.length} {favorites.length === 1 ? "versículo guardado" : "versículos guardados"}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {favorites.map((verse) => (
          <Card
            key={verse.id}
            className="bg-gradient-to-b from-card to-background border-primary/20 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardContent className="p-8 md:p-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-base font-medium tracking-wide uppercase mb-5">
                {verse.detected_category}
              </span>

              <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed mb-6">
                "{verse.verse_text}"
              </p>

              <div className="pt-5 border-t border-border/50 flex items-center justify-between gap-4">
                <span className="font-serif text-xl text-primary font-medium">
                  {verse.verse_reference}
                </span>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => removeFavorite(verse.verse_reference)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-12 px-5 text-base"
                  aria-label="Eliminar de favoritos"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
