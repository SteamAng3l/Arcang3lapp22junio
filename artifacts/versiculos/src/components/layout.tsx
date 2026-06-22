import { Link, useLocation } from "wouter";
import { Heart } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navLink = (href: string, label: string) => {
    const active = location === href;
    return (
      <Link href={href}>
        <span
          className={`cursor-pointer transition-colors hover:text-primary text-xl font-serif px-1 pb-0.5 ${
            active
              ? "text-primary border-b-2 border-primary/40"
              : "text-muted-foreground"
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
        <p className="text-muted-foreground font-serif italic text-xl max-w-md mx-auto text-center">Guía y Mensajero</p>

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
        <p className="text-muted-foreground font-serif text-lg">
          Versículos de la Reina-Valera 1909 · Dominio público
        </p>

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
