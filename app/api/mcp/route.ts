// app/api/mcp/route.ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// ----- Datos "noticias" (puedes mover a /lib si prefieres) -----
const noticias = {
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

// (Opcional) un catálogo de estrategias para exponer como recurso/herramienta
const estrategias = [
  { id: "carry-trade", titulo: "Carry trade", riesgo: "medio", horizonte: "mediano" },
  { id: "hedge-forward", titulo: "Hedge con forward", riesgo: "bajo", horizonte: "corto/mediano" },
  { id: "butterfly", titulo: "Butterfly options FX", riesgo: "medio/alto", horizonte: "evento" },
];

// ----- Helper: llamada a Gemini -----
async function askGemini(prompt: string, model: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(apiKey);
  const gModel = genAI.getGenerativeModel({ model }); // p.ej. gemini-2.5-flash o 1.5-pro
  const result = await gModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }]}],
  });
  return result.response.text() ?? "";
}

// ----- Handler MCP (Next App Router) -----
const handler = createMcpHandler(
  (server) => {
    // Tool: noticias_financieras (sin input)
    server.tool(
        "noticias_financieras",
        "Devuelve noticias filtradas por monedas, aleatoriza y limita resultados",
        {
            // 👈 ZodRawShape (shape plano), NO z.object(...)
            currencies: z.array(z.string().min(3)).optional(),
            mode: z.enum(["any", "all"]).default("any"),
            limit: z.number().int().min(1).max(10).default(5),
        },
        async ({ currencies, mode, limit }) => {
            const all = Object.entries(noticias);

            const filtered = (() => {
            if (!currencies?.length) return all;
            const wanted = new Set(currencies.map((c) => c.toUpperCase()));
            return all.filter(([_, n]) => {
                const have = new Set(n.monedas_afectadas.map((m: string) => m.toUpperCase()));
                const overlap = [...wanted].filter((m) => have.has(m));
                return mode === "all" ? overlap.length === wanted.size : overlap.length > 0;
            });
            })();

            // Fisher–Yates shuffle
            for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
            }

            const picked = filtered.slice(0, limit);
            const subset = Object.fromEntries(picked);

            return {
            content: [
                {
                type: "text",
                text: JSON.stringify(
                    {
                    params: { currencies: currencies ?? null, mode, limit },
                    count_total: all.length,
                    count_filtradas: filtered.length,
                    count_devueltas: picked.length,
                    noticias: subset,
                    },
                    null,
                    2
                ),
                },
            ],
            structuredContent: subset,
            };
        }
    );

    /* ----------------------- Tool: estrategias_disponibles ---------------------- */
        server.tool(
            "estrategias_disponibles",
            "Lista estrategias de cobertura/FX disponibles",
            {}, // sin parámetros
            async () => {
                const payload = { estrategias }; // 👈 ahora es un objeto
                return {
                content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
                structuredContent: payload,     // ✅ Record<string, unknown>
                };
            }
        );

        /* ----------------------------- Tool: ask_gemini ----------------------------- */
        // (opcional) acotar modelos válidos
        const ModelEnum = z.enum(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"]);

        server.tool(
        "ask_gemini",
        "Consulta a Gemini con un prompt y modelo opcional",
        {
            // 👇 shape plano
            prompt: z.string().min(1),
            model: ModelEnum.default("gemini-2.5-flash"),
        },
        async ({ prompt, model }) => {
            const text = await askGemini(prompt, model);
            return {
            content: [{ type: "text", text }],
            structuredContent: { prompt, model, text },
            };
        }
        );

        /* ----------------------------- Resource: estrategia ----------------------------- */
        const tpl = new ResourceTemplate("estrategia://item/{id}", {list:undefined});
        server.resource(
            "estrategia",
            tpl,
            async (uri, variables) => {
                const id = String(variables.id);
                const item = estrategias.find(e => e.id === id);

                if (!item) {
                return {
                    contents: [{
                    uri: uri.toString(),
                    text: `No encontrada: ${id}. Usa uno de: ${estrategias.map(e => e.id).join(", ")}`
                    }]
                };
                }

                return {
                contents: [{
                    uri: uri.toString(),
                    text: JSON.stringify(item, null, 2)
                }]
                };
            }
        );



        /* ----------------------------- Prompt reusable ----------------------------- */
        // Esta API sí acepta z.object(...) en 'input', déjalo igual
        server.prompt(
            "plan_fx_acciones",
            "Plantilla para generar un plan de acciones FX",
            {
                par: z.string().describe("Par de divisa, ej. USD/MXN"),
                horizonte: z.string().describe("Horizonte temporal"),
                cobertura: z.enum(["si","no"]).describe("¿Incluir cobertura? (si/no)"),
            },
            async ({ par, horizonte, cobertura }) => {
                const incluyeCob = cobertura === "si";
                return {
                description: "Plan de acciones FX",
                messages: [
                    {
                    role: "user",
                    content: {
                        type: "text",
                        text:
            `Eres experta en trading FX y hedging.
            Par: ${par}. Horizonte: ${horizonte}.
            Cobertura: ${incluyeCob ? "sí" : "no"}.
            Devuelve bullets con 3–5 acciones concretas.`,
                            },
                        },
                    ],
                };
            }
        );
  },
  // Opciones del servidor MCP (capabilities opcionales)
  {
    capabilities: {
      tools: {
        noticias_financieras: { description: "Noticias de prueba" },
        estrategias_disponibles: { description: "Estrategias FX" },
        ask_gemini: { description: "Puente a Gemini" },
      },
    },
  },
  // Config del adaptador (ruta base, logs, etc.)
  {
    basePath: "/api",     // <- coincide con /api/mcp
    verboseLogs: true,
    // redisUrl: process.env.REDIS_URL,  // si luego quieres fanout pub/sub
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST };
