import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const versesTable = pgTable("verses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  verseReference: text("verse_reference").notNull(),
  verseText: text("verse_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVerseSchema = createInsertSchema(versesTable).omit({ id: true, createdAt: true });
export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof versesTable.$inferSelect;
