export interface CategoryInfo {
  name: string;
  label: string;
  keywords: string[];
  message: string;
}

export const categories: CategoryInfo[] = [
  {
    name: "ansiedad",
    label: "Ansiedad",
    keywords: ["ansiedad", "angustia", "estres", "estrés", "preocupacion", "preocupación", "nervios", "agobio", "ansioso", "ansiosa"],
  },
  {
    name: "miedo",
    label: "Miedo",
    keywords: ["miedo", "temor", "terror", "inseguridad", "asustado", "asustada", "temo", "atemorizado"],
  },
  {
    name: "tristeza",
    label: "Tristeza",
    keywords: ["triste", "tristeza", "dolor", "llanto", "depresion", "depresión", "desanimo", "desánimo", "llorando", "pena"],
  },
  {
    name: "soledad",
    label: "Soledad",
    keywords: ["solo", "sola", "soledad", "abandono", "rechazo", "abandonado", "abandonada", "nadie"],
  },
  {
    name: "perdon",
    label: "Perdón",
    keywords: ["perdon", "perdón", "culpa", "pecado", "fallé", "falle", "arrepentimiento", "vergüenza", "verguenza", "culpable"],
  },
  {
    name: "esperanza",
    label: "Esperanza",
    keywords: ["esperanza", "futuro", "sin salida", "desesperado", "desesperada", "rendirme", "rendirse", "no puedo más", "no puedo mas"],
  },
  {
    name: "fortaleza",
    label: "Fortaleza",
    keywords: ["débil", "debil", "cansado", "cansada", "fuerza", "fortaleza", "batalla", "agotado", "agotada", "cansancio"],
  },
  {
    name: "sabiduria",
    label: "Sabiduría",
    keywords: ["decision", "decisión", "guia", "guía", "sabiduria", "sabiduría", "camino", "qué hacer", "que hacer", "dirección", "direccion"],
  },
];

export function detectCategory(text: string): string {
  const normalized = text.toLowerCase();
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (normalized.includes(keyword)) {
        return category.name;
      }
    }
  }
  return "esperanza";
}

export const categoryMessages: Record<string, string> = {
  ansiedad: "Dios invita a dejar la ansiedad en sus manos. Respira, ora y descansa en su cuidado.",
  miedo: "Cuando hay miedo, la Biblia recuerda que Dios acompaña y fortalece.",
  tristeza: "En medio de la tristeza, Dios permanece cerca del corazón quebrantado.",
  soledad: "Aunque te sientas solo o sola, Dios no abandona a quienes le buscan.",
  perdon: "Hay perdón y restauración para quien se acerca a Dios con sinceridad.",
  esperanza: "Aun cuando parece que no hay salida, Dios sigue siendo fuente de esperanza.",
  fortaleza: "Cuando tus fuerzas se acaban, Dios puede sostenerte y renovarte.",
  sabiduria: "Dios puede dar dirección y sabiduría cuando no sabes qué hacer.",
};

// ─── Relevance scoring ────────────────────────────────────────────────────────

/** Remove Spanish accents: á→a, é→e, í→i, ó→o, ú→u, ü→u */
function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Common Spanish stop-words that carry no search meaning. */
const STOP_WORDS = new Set([
  "y","de","el","la","los","las","que","en","a","es","se","no","un","una",
  "con","por","para","mi","me","te","su","lo","le","del","al","yo","tu",
  "son","si","ya","mas","pero","o","ni","hay","he","ha","han","era","esto",
  "eso","como","muy","asi","pues","porque","cuando","donde","quien","tanto",
  "todo","toda","todos","todas","puede","dios","sus","les","nos","nuestro",
  "nuestra","ellos","ellas","uno","dos","tres","ser","estar","fue","hay",
  "esta","este","ese","esa","esos","esas","entre","sobre","ante","bajo",
  "sin","contra","tras","durante","mediante","segun","hacia","hasta",
  "desde","aunque","sino","bien","cada","más","menos","hizo","tenia",
  "tiene","tengo","quiero","quiere","siento","siente","puedo","puede",
  "volver","volvio","nada","algo","alguien","nunca","siempre","mucho",
  "poco","aqui","alli","ahora","antes","despues",
]);

/**
 * Bridge between modern Spanish emotional vocabulary and archaic RVR1909 Bible text.
 * Maps normalized user-word prefixes to lists of Bible-text prefixes to search.
 *
 * Example: user writes "angustia" (modern) → Bible uses "afan", "angust", "solicit"
 */
const SYNONYM_BRIDGE: Array<{ from: string; to: string[] }> = [
  // Ansiedad / preocupación
  { from: "angust",  to: ["angust", "afan", "solici", "inquie"] },
  { from: "nervio",  to: ["tieml", "espant", "tema", "turbad"] },
  { from: "preocup", to: ["afan", "solici", "cuidad"] },
  { from: "ansieda", to: ["afan", "solici", "inquie"] },
  { from: "agobio",  to: ["carga", "peso", "afan"] },
  { from: "estres",  to: ["afan", "solici", "inquie"] },
  { from: "dormir",  to: ["dormir"] },
  // Tristeza
  { from: "triste",  to: ["triste", "llor", "lament", "afligi", "quebran", "gemir"] },
  { from: "llorar",  to: ["llorar", "lloro", "llorad", "lloran", "llanto", "lament"] },
  { from: "dolor",   to: ["dolor", "angust", "afligi", "llaga"] },
  { from: "depres",  to: ["afligi", "quebran", "desfall", "desfallec"] },
  { from: "pena",    to: ["pena", "afligi", "dolor", "llanto"] },
  { from: "llanto",  to: ["llanto", "llor", "lament", "gemir"] },
  // Miedo
  { from: "miedo",   to: ["miedo", "temas", "tema", "temor", "espant", "pavur"] },
  { from: "temor",   to: ["temor", "temas", "tema", "espant"] },
  { from: "asusta",  to: ["espant", "temas", "tema", "turbe"] },
  { from: "terror",  to: ["terror", "espant", "pavur", "temor"] },
  { from: "morir",   to: ["muerte", "morir", "mueran", "murio", "sepu"] },
  { from: "muerte",  to: ["muerte", "morir", "mueran", "murio", "sepu"] },
  // Soledad
  { from: "solo",    to: ["contig", "dejare", "desampar", "huerfan", "solo", "sola"] },
  { from: "soleda",  to: ["contig", "dejare", "desampar", "solo"] },
  { from: "abandon", to: ["desampar", "dejare", "contig", "abandon"] },
  { from: "rechaz",  to: ["menospre", "despreciad", "desech"] },
  { from: "familia", to: ["familia"] },
  { from: "nadie",   to: ["nadie", "ninguno"] },
  // Perdón
  { from: "perdon",  to: ["perdon"] },
  { from: "culpa",   to: ["pecad", "culpa", "iniquid", "transgres"] },
  { from: "pecado",  to: ["pecad", "iniquid", "culpa", "transgres"] },
  { from: "arrepent",to: ["arrepen", "convers", "vuelvos", "contrito"] },
  { from: "verguen", to: ["verguen", "confundi", "avergon"] },
  { from: "padre",   to: ["padre", "padres", "progenitor"] },
  { from: "madre",   to: ["madre", "madres"] },
  { from: "hijo",    to: ["hijo", "hijos", "hija", "hijas"] },
  // Esperanza
  { from: "esperan", to: ["esperan", "confian", "aguarda", "confia"] },
  { from: "desespe", to: ["esperan", "confia", "aguarda", "animo"] },
  { from: "futuro",  to: ["venir", "porven", "futuro", "dias"] },
  { from: "salida",  to: ["libra", "salva", "rescue", "escap"] },
  // Fortaleza
  { from: "cansad",  to: ["esfuerz", "fuerza", "fortale", "cansad", "renova"] },
  { from: "debil",   to: ["fuerza", "fortale", "esfuerz", "fortif"] },
  { from: "agotad",  to: ["renova", "fuerza", "descans", "esfuerz"] },
  { from: "fuerzas", to: ["fuerza", "esfuerz", "fortale", "vigor"] },
  { from: "batall",  to: ["batall", "guerra", "combate", "pelear"] },
  // Sabiduría
  { from: "decisi",  to: ["camino", "sabidu", "ensen", "instruy"] },
  { from: "sabidu",  to: ["sabidu", "entend", "instruy", "ciencia"] },
  { from: "camino",  to: ["camino", "senda", "vereda"] },
  { from: "matrim",  to: ["matrimon", "casad"] },
  { from: "guia",    to: ["guia", "dirigir", "encamin", "ensen"] },
];

/** Truncate to first 5 chars for lightweight stemming (handles conjugations). */
function stem(word: string): string {
  if (word.length <= 5) return word;
  return word.slice(0, 5);
}

/**
 * Tokenizes text into meaningful Spanish words.
 * Returns accent-free, lowercase tokens ≥ 4 chars, without stop-words.
 */
export function extractKeywords(text: string): string[] {
  const clean = removeAccents(text.toLowerCase()).replace(/[^a-z\s]/g, " ");
  return clean
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

/**
 * Expands user keywords with Bible-vocabulary synonyms and stems.
 *
 * For each user keyword:
 * 1. Add its 5-char stem (so "perdonar" → "perdo", matching "perdone", "perdonad", etc.)
 * 2. Look up synonym bridge entries whose `from` prefix matches the keyword,
 *    adding all `to` prefixes so modern emotional words map to archaic Bible words.
 *
 * Returns a deduplicated list of search patterns.
 */
export function enrichKeywords(keywords: string[]): string[] {
  const enriched = new Set<string>();
  for (const word of keywords) {
    enriched.add(word);
    enriched.add(stem(word));
    for (const entry of SYNONYM_BRIDGE) {
      if (word.startsWith(entry.from) || entry.from.startsWith(stem(word))) {
        for (const t of entry.to) enriched.add(t);
      }
    }
  }
  return Array.from(enriched);
}

/**
 * Scores a Bible verse against a set of enriched search patterns.
 * Uses partial (substring) matching on accent-free text.
 * Higher score = more patterns found in the verse.
 */
export function scoreVerse(verseText: string, patterns: string[]): number {
  if (patterns.length === 0) return 0;
  const normalizedVerse = removeAccents(verseText.toLowerCase());
  return patterns.reduce(
    (score, pat) => (normalizedVerse.includes(pat) ? score + 1 : score),
    0
  );
}

/**
 * Judgment/destruction language patterns.
 * Verses containing these phrases should be excluded from comfort results
 * because they represent prophecy of punishment, not consolation.
 */
const JUDGMENT_PATTERNS = [
  "no perdonare", "no perdonaré",
  "no tendre piedad", "no tendré piedad",
  "destruire", "destruiré",
  "castigare", "castigaré",
  "espada sobre vosotros",
  "enviaré sobre vosotros",
  "matare a tu pueblo", "mataré a tu pueblo",
  "sera destruida", "será destruida",
  "seran destruidos", "serán destruidos",
  "los quemare", "los quemaré",
];

/** Returns true if a verse contains judgment/punishment language. */
export function isJudgmentVerse(verseText: string): boolean {
  const normalized = removeAccents(verseText.toLowerCase());
  return JUDGMENT_PATTERNS.some((p) => normalized.includes(p));
}

/**
 * Well-known "classic" comfort verses for each category.
 * Used as the guaranteed fallback when keyword scoring returns 0 for all verses.
 * These are canonical Bible references verified to be consoling.
 */
export const FEATURED_VERSES: Record<string, string> = {
  ansiedad:   "Filipenses 4:6",   // "Por nada estéis afanosos; más bien, en todo..."
  miedo:      "Isaías 41:10",     // "No temas, porque yo soy contigo..."
  tristeza:   "Salmos 34:18",     // "Cercano está Jehová á los quebrantados de corazón..."
  soledad:    "Hebreos 13:5",     // "No te desampararé, ni te dejaré..."
  perdon:     "1 Juan 1:9",       // "Si confesamos nuestros pecados, él es fiel y justo..."
  esperanza:  "Jeremías 29:11",   // "Yo sé los pensamientos que tengo acerca de vosotros..."
  fortaleza:  "Isaías 40:31",     // "Los que esperan á Jehová tendrán nuevas fuerzas..."
  sabiduria:  "Proverbios 3:5",   // "Confía en Jehová de todo tu corazón..."
};
