import { useState, useRef, useEffect } from "react";
import { findVerse, randomVerse, type VerseResult } from "@/lib/verse-engine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Send, Heart, HeartOff, Mic, Bell, Volume2 } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { VerseShareButtons } from "@/components/verse-share-buttons";

const scheduleNotif = () => {
  if (Notification.permission !== "granted") return;
  const now = new Date();
  if (localStorage.getItem("lastNotifDate") === now.toDateString()) return;
  const target = new Date(now);
  target.setHours(9, 24, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  setTimeout(() => {
    const searches: string[] = JSON.parse(localStorage.getItem("searches") || "[]");
    const sent: string[] = JSON.parse(localStorage.getItem("sentVerses") || "[]");
    const query = searches[Math.floor(Math.random() * searches.length)] || "";
    let verse = query ? findVerse(query) : randomVerse();
    if (sent.includes(verse.verse_reference)) verse = randomVerse();
    const fecha = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" });
    new Notification(`Versículo del Día – ${fecha}`, {
      body: `"${verse.verse_text}" — ${verse.verse_reference}`,
      icon: "/favicon.svg"
    });
    sent.push(verse.verse_reference);
    localStorage.setItem("sentVerses", JSON.stringify(sent.slice(-100)));
    localStorage.setItem("lastNotifDate", new Date().toDateString());
    scheduleNotif();
  }, target.getTime() - now.getTime());
};

export default function Home() {
  const [problem, setProblem] = useState("");
  const [activeVerse, setActiveVerse] = useState<VerseResult | null>(null);
  const [listening, setListening] = useState(false);
  const [notif, setNotif] = useState(() => localStorage.getItem("notifActiva") === "true");
  const [speaking, setSpeaking] = useState(false);
  const recogRef = useRef<SpeechRecognition | null>(null);

  const speak = () => {
    if (!activeVerse) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(`${activeVerse.verse_text}. ${activeVerse.verse_reference}`);
    u.lang = "es-ES";
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
    if (notif && Notification.permission === "granted") scheduleNotif();
  }, []);

  const toggleNotif = async () => {
    const next = !notif;
    setNotif(next);
    localStorage.setItem("notifActiva", String(next));
    if (next && "Notification" in window) {
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission === "granted") {
        new Notification("Arcángel", { body: "Recibirás un versículo diario a las 9:24 a.m." });
        scheduleNotif();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;
    const searches: string[] = JSON.parse(localStorage.getItem("searches") || "[]");
    searches.unshift(problem.trim());
    localStorage.setItem("searches", JSON.stringify(searches.slice(0, 20)));
    setActiveVerse(findVerse(problem.trim()));
  };

  const handleRandom = () => {
    setActiveVerse(randomVerse());
  };

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "es-ES";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setProblem(t);
      setActiveVerse(findVerse(t));
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  const stopMic = () => {
    recogRef.current?.stop();
    setListening(false);
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
    <div className="w-full flex flex-col gap-12 animate-in fade-in duration-700">
      <section className="bg-card rounded-2xl p-7 md:p-10 shadow-sm border border-border/50">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-3 text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-serif text-foreground leading-snug">
              Soy Arcángel, estoy aquí para ayudarte a encontrar paz en la Palabra.
            </h2>
            <p className="text-muted-foreground text-xl font-serif">
              ¿Qué hay en tu corazón hoy?
            </p>
          </div>

          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Escribe cómo te sientes, tus preocupaciones o tus miedos..."
            className="min-h-[140px] resize-none bg-background/50 border-border focus-visible:ring-primary/30 text-xl p-5 font-serif leading-relaxed"
            data-testid="input-problem"
          />

          <div className="flex justify-center">
            <button
              type="button"
              onMouseDown={startMic}
              onMouseUp={stopMic}
              onTouchStart={startMic}
              onTouchEnd={stopMic}
              className={`cuadro flex items-center gap-2 px-6 py-3 text-lg font-serif rounded-full border border-primary/20 transition-all ${listening ? "ring-2 ring-primary scale-105" : ""}`}
            >
              <Mic className={`h-5 w-5 ${listening ? "text-red-500 animate-pulse" : "text-primary"}`} />
              {listening ? "Escuchando..." : "Mantén para hablar"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              type="submit"
              disabled={!problem.trim()}
              className="w-full sm:w-auto font-serif text-xl h-14 px-10 rounded-full"
              data-testid="button-submit-problem"
            >
              <Send className="mr-2 h-5 w-5 opacity-70" />
              Buscar versículo
            </Button>

            <span className="text-muted-foreground/50 hidden sm:inline text-xl">o</span>

            <Button
              type="button"
              variant="outline"
              onClick={handleRandom}
              className="w-full sm:w-auto font-serif text-xl h-14 px-10 rounded-full bg-transparent border-primary/20 hover:bg-primary/5 hover:text-primary"
              data-testid="button-random-verse"
            >
              <BookOpen className="mr-2 h-5 w-5 opacity-70" />
              Versículo aleatorio
            </Button>
          </div>
        </form>
      </section>

      {activeVerse && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center mb-8">
            <span
              className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-base font-medium tracking-wide uppercase mb-4"
              data-testid="text-detected-category"
            >
              {activeVerse.detected_category}
            </span>
            <p
              className="text-xl text-muted-foreground font-serif italic max-w-lg mx-auto leading-relaxed"
              data-testid="text-message"
            >
              {activeVerse.message}
            </p>
          </div>

          <Card className="cuadro border-primary/20 shadow-md relative w-[90%] max-w-[500px] mx-auto max-h-[80vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardContent className="p-5 md:p-8 text-center">
              <p
                className="text-lg md:text-2xl font-serif text-foreground leading-relaxed"
                data-testid="text-verse"
              >
                "{activeVerse.verse_text}"
              </p>
              <div className="mt-8 pt-8 border-t border-border/50 flex flex-col items-center gap-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                  <span
                    className="font-serif text-2xl text-primary font-medium"
                    data-testid="text-verse-reference"
                  >
                    {activeVerse.verse_reference}
                  </span>
                  <Button
                    variant={saved ? "default" : "outline"}
                    size="lg"
                    onClick={toggleFavorite}
                    className="rounded-full h-12 px-7 text-lg font-serif gap-2"
                    data-testid="button-save-favorite"
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
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={toggleNotif}
          className={`cuadro flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-serif rounded-2xl border transition-all ${notif ? "border-primary/50 text-primary" : "border-primary/20 text-muted-foreground"}`}
        >
          <Bell className="h-3.5 w-3.5" />
          Versículo del día: <span className="font-bold">{notif ? "ON" : "OFF"}</span>
        </button>
        <button
          type="button"
          onClick={speak}
          disabled={!activeVerse}
          className={`cuadro flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-serif rounded-2xl border transition-all ${speaking ? "border-primary/50 text-primary" : "border-primary/20 text-muted-foreground"} ${!activeVerse ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Volume2 className={`h-3.5 w-3.5 ${speaking ? "animate-pulse" : ""}`} />
          {speaking ? "Detener" : "Escuchar versículo"}
        </button>
      </div>
    </div>
  );
}
