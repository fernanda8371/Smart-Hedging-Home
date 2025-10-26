// app/api/news/analyze/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";

/** ---------- Tipos/Esquemas ---------- */
const NoticiaSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  monedas_afectadas: z.array(z.string().min(3)),
  calificacion_impacto: z.array(z.string().regex(/^\d+\/10$/)).optional().default([]),
  imageUrl: z.string().optional(),
  timestamp: z.string().optional()
});
type Noticia = z.infer<typeof NoticiaSchema>;

const NoticiasFileSchema = z.record(z.string(), NoticiaSchema);

const BodySchema = z.object({
  currencies: z.array(z.string().min(3)).optional(),
  mode: z.enum(["any", "all"]).optional().default("any"),
  limit: z.number().int().min(1).max(10).optional().default(5),
  model: z.enum(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"]).optional().default("gemini-2.5-flash")
});

type PickParams = { currencies?: string[]; limit: number; mode: "any" | "all" };

/** ---------- Carga + cache de noticias.json ---------- */
const NEWS_PATH = path.join(process.cwd(),"noticias.json");

// Cache simple en memoria para evitar leer disco en cada request
let _cache: { map: Record<string, Noticia>; entries: [string, Noticia][] } | null = null;

async function loadNoticias(): Promise<{ map: Record<string, Noticia>; entries: [string, Noticia][] }> {
  if (_cache) return _cache;
  const raw = await fs.readFile(NEWS_PATH, "utf-8");
  const json = JSON.parse(raw);
  const parsed = NoticiasFileSchema.parse(json); // valida estructura
  const entries = Object.entries(parsed);
  _cache = { map: parsed, entries };
  return _cache;
}

/** ---------- Utilidad: barajar y seleccionar ---------- */
function pickNoticias(entries: [string, Noticia][], params: PickParams) {
  let filtered = entries;

  if (params.currencies?.length) {
    const wanted = new Set(params.currencies.map(c => c.toUpperCase()));
    filtered = entries.filter(([_, n]) => {
      const have = new Set(n.monedas_afectadas.map(m => m.toUpperCase()));
      const overlap = [...wanted].filter(m => have.has(m));
      return params.mode === "all" ? overlap.length === wanted.size : overlap.length > 0;
    });
  }

  // Fisher–Yates
  const arr = filtered.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, params.limit).map(([id, n]) => ({ id, ...n }));
}

/** ---------- Llamada a Gemini ---------- */
async function askGeminiForDashboard(
  selected: Array<{ id: string } & Noticia>,
  model: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  const gModel = genAI.getGenerativeModel({ model });

  const prompt =
`Eres analista FX. Recibes un arreglo de noticias JSON con campos {id, titulo, descripcion, monedas_afectadas, calificacion_impacto}.
Devuelve EXCLUSIVAMENTE un JSON con este schema:
{
  "items": [
    {
      "newsId": "string",
      "newsTitle": "string",
      "impactPairs": [
        { "pair": "string", "direction": "up|down", "score": "X/10" }
      ]
    }
  ]
}
Reglas:
- "items" debe tener la MISMA cantidad y orden que las noticias de entrada.
- "newsId" = id; "newsTitle" = titulo.
- Por cada moneda en "monedas_afectadas", agrega una entrada en "impactPairs".
- "pair": puedes usar solo el código ("USD") o un par ("USD/EUR") si aplica.
- "direction": "up" si tendería a fortalecer la moneda, "down" si tendería a debilitarla.
- "score": usa "calificacion_impacto" alineada si existe; si faltan, estima un valor similar.
- No agregues explicaciones ni backticks; SOLO el JSON.

Noticias:
${JSON.stringify(selected, null, 2)}`;

  const result = await gModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let raw = result.response.text() ?? "";
  if (!raw.trim()) throw new Error("Gemini devolvió respuesta vacía");
  raw = raw.replace(/```json|```/g, "").trim();

  // (Opcional) podrías validar la salida con Zod
  const data = JSON.parse(raw);
  return data; // { items: [...] }
}

/** ---------- Fallback si Gemini falla ---------- */
function fallbackDashboard(selected: Array<{ id: string } & Noticia>) {
  return {
    items: selected.map(n => ({
      newsId: n.id,
      newsTitle: n.titulo,
      impactPairs: n.monedas_afectadas.map((m, idx) => ({
        pair: m,
        direction: "up" as const,
        score: n.calificacion_impacto[idx] ?? "5/10",
      })),
    })),
  };
}

/** ---------- POST handler ---------- */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { currencies, limit, mode, model } = BodySchema.parse(body);

    const { entries } = await loadNoticias();

    const selected = pickNoticias(entries, { currencies, limit, mode });

    let dashboard;
    try {
      dashboard = await askGeminiForDashboard(selected, model);
    } catch (e) {
      console.error("Gemini error:", e);
      dashboard = fallbackDashboard(selected);
    }

    return NextResponse.json({
      success: true,
      items: dashboard.items,
      // opcional: pasa metadata útil al front
      meta: {
        picked: selected.map(({ id, imageUrl, timestamp }) => ({ id, imageUrl, timestamp }))
      }
    });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json({ success: false, error: "Analyze failed" }, { status: 500 });
  }
}
