import { Router, type IRouter } from "express";
import { sql, eq } from "drizzle-orm";
import { db, versesTable } from "@workspace/db";
import {
  GetVerseBody,
  GetVerseResponse,
  GetCategoriesResponseItem,
  GetCategoriesResponse,
  GetRandomVerseResponse,
  GetVerseStatsResponseItem,
  GetVerseStatsResponse,
} from "@workspace/api-zod";
import {
  detectCategory,
  categoryMessages,
  categories,
  extractKeywords,
  enrichKeywords,
  scoreVerse,
  isJudgmentVerse,
  FEATURED_VERSES,
} from "../lib/verse-categories";

const router: IRouter = Router();

/**
 * Finds the most relevant verse for a user's problem text.
 *
 * Algorithm:
 *  1. Detect the emotional category from the user's input (keyword matching).
 *  2. Fetch ALL verses in that category from the DB.
 *  3. Exclude judgment/punishment passages (not consoling).
 *  4. Tokenize + enrich the user's text: extract keywords, add 5-char stems
 *     and Bible-vocabulary synonyms (bridges modern Spanish ↔ archaic RVR1909).
 *  5. Score each verse by how many patterns appear in its text.
 *  6. Return the highest-scoring verse; ties broken randomly for variety.
 *  7. If ALL scores are 0 (no keyword overlap found), fall back to the
 *     canonical "featured verse" for that category — a well-known comfort
 *     verse that is always meaningful regardless of the user's specific words.
 */
async function findBestVerse(
  problem: string,
  category: string
): Promise<{ id: number; category: string; verseReference: string; verseText: string } | null> {
  const allInCategory = await db
    .select()
    .from(versesTable)
    .where(eq(versesTable.category, category));

  if (allInCategory.length === 0) return null;

  // Step 1: exclude judgment/punishment passages
  const comforting = allInCategory.filter((v) => !isJudgmentVerse(v.verseText));

  // Step 2: build enriched search patterns
  const keywords = extractKeywords(problem);
  const patterns = enrichKeywords(keywords);

  // Step 3: score and select
  const scored = comforting.map((v) => ({
    ...v,
    score: scoreVerse(v.verseText, patterns),
  }));

  const maxScore = Math.max(...scored.map((v) => v.score));

  if (maxScore > 0) {
    // Pick randomly among all verses tied at the highest score (adds variety)
    const topGroup = scored.filter((v) => v.score === maxScore);
    const chosen = topGroup[Math.floor(Math.random() * topGroup.length)];
    return {
      id: chosen.id,
      category: chosen.category,
      verseReference: chosen.verseReference,
      verseText: chosen.verseText,
    };
  }

  // Step 4: score=0 for all → use the featured "classic" verse for this category
  const featuredRef = FEATURED_VERSES[category];
  if (featuredRef) {
    const featured = comforting.find((v) => v.verseReference === featuredRef);
    if (featured) {
      return {
        id: featured.id,
        category: featured.category,
        verseReference: featured.verseReference,
        verseText: featured.verseText,
      };
    }
  }

  // Last resort: random verse from the comforting subset
  const rand = comforting[Math.floor(Math.random() * comforting.length)];
  return rand
    ? { id: rand.id, category: rand.category, verseReference: rand.verseReference, verseText: rand.verseText }
    : null;
}

router.post("/verse", async (req, res): Promise<void> => {
  const parsed = GetVerseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Por favor escribe un problema o situación." });
    return;
  }

  const { problem } = parsed.data;

  if (!problem || problem.trim() === "") {
    res.status(400).json({ error: "Por favor escribe un problema o situación." });
    return;
  }

  const detectedCategory = detectCategory(problem);
  const verse = await findBestVerse(problem.trim(), detectedCategory);

  if (!verse) {
    res.status(404).json({ error: "No se encontró un versículo para esa situación." });
    return;
  }

  const message = categoryMessages[verse.category] ?? categoryMessages["esperanza"];

  res.json(
    GetVerseResponse.parse({
      detected_category: verse.category,
      message,
      verse_reference: verse.verseReference,
      verse_text: verse.verseText,
    })
  );
});

router.get("/categories", async (req, res): Promise<void> => {
  const counts = await db
    .select({
      category: versesTable.category,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(versesTable)
    .groupBy(versesTable.category);

  const countMap = Object.fromEntries(counts.map((r) => [r.category, r.count]));

  const result = categories.map((cat) =>
    GetCategoriesResponseItem.parse({
      category: cat.name,
      label: cat.label,
      verse_count: countMap[cat.name] ?? 0,
    })
  );

  res.json(GetCategoriesResponse.parse(result));
});

router.get("/verse/random", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(versesTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "No se encontraron versículos." });
    return;
  }

  const row = rows[0];
  const message = categoryMessages[row.category] ?? categoryMessages["esperanza"];

  res.json(
    GetRandomVerseResponse.parse({
      detected_category: row.category,
      message,
      verse_reference: row.verseReference,
      verse_text: row.verseText,
    })
  );
});

router.get("/verse/stats", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: versesTable.category,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(versesTable)
    .groupBy(versesTable.category)
    .orderBy(versesTable.category);

  res.json(GetVerseStatsResponse.parse(rows));
});

export default router;
