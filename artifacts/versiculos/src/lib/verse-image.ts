import type { VerseResponse } from "@workspace/api-client-react";

const SIZE = 1080;
const AMBER = "#C8924A";
const AMBER_DIM = "rgba(200, 146, 74, 0.22)";
const BROWN_DARK = "#3D2B1F";
const BROWN_MED = "#7A5C45";
const BEIGE_TOP = "#EDE6D8";
const BEIGE_BTM = "#F5F0E8";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number
) {
  ctx.fillText(text, SIZE / 2, y);
}

function drawLine(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = AMBER_DIM;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, y);
  ctx.lineTo(SIZE - 140, y);
  ctx.stroke();
}

export async function generateVerseImage(verse: VerseResponse): Promise<Blob> {
  // Ensure fonts are loaded before drawing
  await Promise.all([
    document.fonts.load(`600 68px "Cormorant Garamond"`),
    document.fonts.load(`italic 400 44px "Cormorant Garamond"`),
    document.fonts.load(`600 38px "Cormorant Garamond"`),
    document.fonts.load(`400 26px "Inter"`),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const fondo = new Image();
  fondo.src = "/fondo.jpg";
  await fondo.decode();
  ctx.drawImage(fondo, 0, 0, SIZE, SIZE);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = AMBER;
  ctx.fillRect(0, 0, SIZE, 10);
  ctx.fillRect(0, SIZE - 10, SIZE, 10);

  // ── Header ───────────────────────────────────────────────────────────────
  ctx.textAlign = "center";
  ctx.fillStyle = AMBER;
  ctx.font = `600 66px "Cormorant Garamond"`;
  drawCenteredText(ctx, "Arcángel", 105);

  ctx.fillStyle = BROWN_MED;
  ctx.font = `italic 400 28px "Cormorant Garamond"`;
  drawCenteredText(ctx, "Guía espiritual de la Palabra", 148);

  // Cross
  ctx.fillStyle = "rgba(200, 146, 74, 0.45)";
  ctx.font = `400 36px serif`;
  drawCenteredText(ctx, "✝", 202);

  drawLine(ctx, 232);

  // Category label
  const catLabel = verse.detected_category.toUpperCase();
  ctx.fillStyle = AMBER;
  ctx.font = `500 24px "Inter", sans-serif`;
  // Manual letter-spacing via character-by-character rendering
  const letters = catLabel.split("");
  const spacing = 5;
  ctx.font = `500 24px "Inter", sans-serif`;
  const totalW =
    letters.reduce((acc: number, ch: string) => acc + ctx.measureText(ch).width, 0) +
    spacing * (letters.length - 1);
  let lx = SIZE / 2 - totalW / 2;
  const catY = 284;
  for (const ch of letters) {
    ctx.fillText(ch, lx + ctx.measureText(ch).width / 2, catY);
    lx += ctx.measureText(ch).width + spacing;
  }

  // ── Verse text (adaptive size) ───────────────────────────────────────────
  const VERSE_ZONE_TOP = 314;
  const VERSE_ZONE_BTM = 860;
  const ZONE_H = VERSE_ZONE_BTM - VERSE_ZONE_TOP;
  const MAX_W = 860;
  const verseStr = `"${verse.verse_text}"`;

  let fontSize = 44;
  let lines: string[] = [];

  while (fontSize >= 26) {
    ctx.font = `italic 400 ${fontSize}px "Cormorant Garamond"`;
    lines = wrapText(ctx, verseStr, MAX_W);
    const blockH = lines.length * fontSize * 1.55;
    if (blockH <= ZONE_H - 80) break;
    fontSize -= 3;
  }

  const lineH = fontSize * 1.55;
  const blockH = lines.length * lineH;
  const startY = VERSE_ZONE_TOP + (ZONE_H - blockH - 80) / 2 + fontSize;

  ctx.fillStyle = BROWN_DARK;
  ctx.font = `italic 400 ${fontSize}px "Cormorant Garamond"`;
  lines.forEach((line, i) => {
    drawCenteredText(ctx, line, startY + i * lineH);
  });

  // Verse reference
  const refY = startY + blockH + 52;
  ctx.fillStyle = AMBER;
  ctx.font = `600 36px "Cormorant Garamond"`;
  drawCenteredText(ctx, `— ${verse.verse_reference}`, refY);

  // ── Footer ───────────────────────────────────────────────────────────────
  drawLine(ctx, SIZE - 115);

  ctx.fillStyle = BROWN_MED;
  ctx.font = `400 25px "Inter", sans-serif`;
  drawCenteredText(
    ctx,
    "Descubre tu versículo en Arcángel — tu guía espiritual",
    SIZE - 76
  );

  ctx.fillStyle = AMBER;
  ctx.font = `600 22px "Inter", sans-serif`;
  drawCenteredText(ctx, window.location.origin, SIZE - 44);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo generar la imagen"));
      },
      "image/png"
    );
  });
}
