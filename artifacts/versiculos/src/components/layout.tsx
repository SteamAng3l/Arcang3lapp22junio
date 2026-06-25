import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Share2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [showRedes, setShowRedes] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if ((e.key === "Enter" || e.key === " ") && el.getAttribute("role") === "button") {
        e.preventDefault();
        el.click();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navLink = (href: string, label: string) => {
    const active = location === href;
    return (
      <Link href={href}>
        <span
          className={`cursor-pointer text-xl font-serif px-5 py-2 rounded-full transition-all ${
            active
              ? "bg-[#1a1a1a] text-white"
              : "bg-[#1a1a1a] text-white opacity-70 hover:opacity-100"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 pt-10 pb-6">
      <header className="mb-14 text-center space-y-4">
        <Link href="/" className="inline-block group" data-testid="link-home">
          <h1 className="text-5xl md:text-6xl font-serif text-primary tracking-tight transition-opacity group-hover:opacity-80">
            Arcángel
          </h1>
        </Link>
        <p className="text-muted-foreground font-serif italic text-xl max-w-md mx-auto text-center">Guía y Mensajero de la Palabra</p>

        <nav className="flex justify-center gap-8 mt-8 flex-wrap" aria-label="Navegación principal">
          {navLink("/", "Inicio")}
          {navLink("/categorias", "Categorías")}
          {navLink("/favoritos", "Mis Favoritos")}
        </nav>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="mt-16 pt-6 border-t border-border/40 text-center space-y-5">
        <button
          onClick={() => setShowRedes(!showRedes)}
          className="cuadro inline-flex items-center gap-2 font-serif text-lg px-6 py-3 rounded-full border border-primary/20 text-primary transition-all hover:border-primary/50"
        >
          <Share2 className="h-5 w-5" />
          Redes Sociales
        </button>

        {showRedes && (
          <div className="cuadro text-left rounded-2xl p-8 space-y-3 border border-primary/20">
            <h2 className="font-serif text-2xl text-primary mb-4 text-center">Redes Sociales</h2>
            {["Tienda Virtual", "Facebook", "Instagram", "YouTube", "TikTok"].map(r => (
              <p key={r} className="font-serif text-lg text-muted-foreground">{r}: <span className="italic">Próximamente</span></p>
            ))}
            <div className="text-center pt-4">
              <button onClick={() => setShowRedes(false)} className="cuadro font-serif px-5 py-2 rounded-full border border-primary/20 text-primary text-lg">Cerrar</button>
            </div>
          </div>
        )}

        <p className="text-muted-foreground font-serif text-lg">Versículos de la Biblia Reina-Valera 1909 (RVR1909) · Dominio público</p>

        {/* Botón de donación */}
        <a
          href="https://www.buymeacoffee.com/TU_USUARIO"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-serif text-lg px-6 py-3 rounded-full transition-colors border border-primary/20"
          aria-label="Apoyar el proyecto con una donación"
        >
          <Heart className="h-5 w-5" />
          Apoyar este proyecto
        </a>
        <p className="text-muted-foreground text-base">
          Actualiza el enlace de donación en el código cuando tengas tu cuenta lista.
        </p>

        {/* Espacio reservado para Google AdSense */}
        {/* Para activar AdSense: reemplaza "ca-pub-XXXXXXXXXXXXXXXX" con tu Publisher ID */}
        {/* y descomenta el script en index.html */}
        <div
          id="adsense-banner"
          className="w-full min-h-[60px] flex items-center justify-center rounded-xl border border-dashed border-border/60 text-muted-foreground/40 text-sm"
          aria-hidden="true"
        >
          Espacio reservado para anuncios (Google AdSense)
        </div>
      </footer>
    </div>
  );
}
