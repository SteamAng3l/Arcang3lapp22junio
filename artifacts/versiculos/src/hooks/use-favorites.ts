import { useState, useEffect, useCallback } from "react";

export interface FavoriteVerse {
  id: string;
  detected_category: string;
  message: string;
  verse_reference: string;
  verse_text: string;
  saved_at: string;
}

const STORAGE_KEY = "arcangel_favorites";

function loadFavorites(): FavoriteVerse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteVerse[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteVerse[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteVerse[]>(loadFavorites);

  const addFavorite = useCallback(
    (verse: Omit<FavoriteVerse, "id" | "saved_at">) => {
      setFavorites((prev) => {
        const alreadyExists = prev.some(
          (f) => f.verse_reference === verse.verse_reference
        );
        if (alreadyExists) return prev;
        const next = [
          {
            ...verse,
            id: `${verse.verse_reference}-${Date.now()}`,
            saved_at: new Date().toISOString(),
          },
          ...prev,
        ];
        saveFavorites(next);
        return next;
      });
    },
    []
  );

  const removeFavorite = useCallback((verseReference: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.verse_reference !== verseReference);
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (verseReference: string) =>
      favorites.some((f) => f.verse_reference === verseReference),
    [favorites]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
