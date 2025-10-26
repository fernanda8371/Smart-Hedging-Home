// app/api/news/analyze/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

/** ---------- 1) Dataset local (puedes importarlo desde /lib si quieres) ---------- */
const noticias: Record<string | number, {
  titulo: string;
  descripcion: string;
  monedas_afectadas: string[];
  calificacion_impacto: string[];
}> = {
  1: {
    titulo: "Mercados financieros globales en alza",
    descripcion:
      "Los mercados financieros globales han experimentado un aumento significativo debido a las expectativas de recuperación económica post-pandemia.",
    monedas_afectadas: ["USD", "EUR", "JPY"],
    calificacion_impacto: ["5/10", "6/10", "4/10"],
  },
  2: {
    titulo: "Aumento de la inflación en EE.UU.",
    descripcion:
      "La inflación en EE.UU. ha alcanzado un nuevo máximo en los últimos 12 meses, afectando el poder adquisitivo de los consumidores.",
    monedas_afectadas: ["USD"],
    calificacion_impacto: ["7/10"],
  },
  3: {
    titulo: "Tensiones comerciales entre China y EE.UU.",
    descripcion:
      "Las tensiones comerciales entre China y EE.UU. continúan afectando los mercados financieros, con posibles repercusiones en las cadenas de suministro globales.",
    monedas_afectadas: ["CNY", "USD"],
    calificacion_impacto: ["6/10", "5/10"],
  },
  4: {
    titulo: "Innovaciones tecnológicas en fintech",
    descripcion:
      "El sector fintech está experimentando un auge en innovaciones tecnológicas que están transformando los servicios financieros.",
    monedas_afectadas: ["USD", "EUR"],
    calificacion_impacto: ["4/10", "4/10"],
  },
  5: {
    titulo: "Políticas monetarias de los bancos centrales",
    descripcion:
      "Los bancos centrales están ajustando sus políticas monetarias para abordar la inflación y estimular el crecimiento económico.",
    monedas_afectadas: ["USD", "EUR", "GBP"],
    calificacion_impacto: ["6/10", "5/10", "4/10"],
  },
};

/** ---------- 2) Body opcional (filtros) ---------- */
const BodySchema = z.object({
  currencies: z.array(z.string().min(3)).optional(),
  mode: z.enum(["any", "all"]).optional().default("any"),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

/** ---------- 3) Pick 5 noticias (shuffle + slice) ---------- */
function pickNoticias(params: { currencies?: string[]; limit: number; mode: "any" | "all" }) {
  const all = Object.entries(noticias);
  let filtered = all;

  if (params.currencies?.length) {
    const wanted = new Set(params.currencies.map(c => c.toUpperCase()));
    filtered = all.filter(([_, n]) => {
      const have = new Set(n.monedas_afectadas.map(m => m.toUpperCase()));
      const overlap = [...wanted].filter(m => have.has(m));
      return params.mode === "all" ? overlap.length === wanted.size : overlap.length > 0;
    });
  }

  // Fisher–Yates shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, params.limit).map(([id, n]) => ({ id: String(id), ...n }));
}

/** ---------- 4) Llamada a Gemini para obtener JSON del dashboard ---------- */
async function askGeminiForDashboard(
  selected: ReturnType<typeof pickNoticias>,
  model: string = "gemini-2.5-flash"
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
      "newsId":"string",
      "newsTitle":"string",
      "impactPairs":[
        {"pair":"string","direction":"up|down","score":"X/10"}
      ]
    }
  ]
}
Reglas:
- "items" debe tener la MISMA cantidad y orden que las noticias de entrada.
- "newsId" = id; "newsTitle" = titulo.
- Por cada moneda en "monedas_afectadas", agrega una entrada en "impactPairs".
- "pair": puedes usar solo el código ("USD") o un par ("USD/EUR") si aplica.
- "direction": "up" si la noticia tendería a fortalecer la moneda, "down" si tendería a debilitarla.
- "score": usa "calificacion_impacto" alineada si es posible; si faltan, estima un valor similar.
- No agregues explicaciones ni backticks; SOLO el JSON.

Noticias:
${JSON.stringify(selected, null, 2)}`;

  const result = await gModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // El modelo suele devolver texto plano con el JSON
  let raw = result.response.text() ?? "";
  if (!raw.trim()) throw new Error("Gemini devolvió respuesta vacía");

  // Quita ```json ... ``` si viene formateado
  raw = raw.replace(/```json|```/g, "").trim();

  // Parseo simple (puedes añadir Zod si quieres validar fuerte)
  const data = JSON.parse(raw);
  return data; // { items: [...] }
}

/** ---------- 5) Fallback simple si Gemini falla ---------- */
function fallbackDashboard(selected: ReturnType<typeof pickNoticias>) {
  return {
    items: selected.map(n => ({
      newsId: n.id,
      newsTitle: n.titulo,
      impactPairs: n.monedas_afectadas.map((m, idx) => ({
        pair: m,
        direction: "up" as const, // heurística simple
        score: n.calificacion_impacto[idx] ?? "5/10",
      })),
    })),
  };
}

/** ---------- 6) Handler POST ---------- */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { currencies, limit, mode } = BodySchema.parse(body);

    // (a) elegir 5 noticias (o las que pidas en limit)
    const selected = pickNoticias({ currencies, limit, mode });

    // (b) invocar a Gemini para convertir → JSON de dashboard
    let dashboard;
    try {
      dashboard = await askGeminiForDashboard(selected);
    } catch (e) {
      console.error("Gemini error:", e);
      dashboard = fallbackDashboard(selected);
    }

    // (c) regresar JSON listo para el front
    return NextResponse.json({ success: true, items: dashboard.items });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json({ success: false, error: "Analyze failed" }, { status: 500 });
  }
}
