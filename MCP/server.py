# server.py (versión simple)
import os
from fastmcp import FastMCP
from google import genai
from dotenv import load_dotenv

load_dotenv()

mcp = FastMCP("gemini-mcp")

# def _ask_gemini_core(prompt: str, model: str = "gemini-2.5-flash") -> str:
#     api_key = os.getenv("GEMINI_API_KEY")
#     if not api_key:
#         raise RuntimeError("Falta GEMINI_API_KEY")
#     client = genai.Client(api_key=api_key)
#     resp = client.models.generate_content(model=model, contents=prompt)
#     return (resp.text or "").strip()

# @mcp.tool
# def ask_gemini(prompt: str, model: str = "gemini-1.5-flash") -> str:
#     return _ask_gemini_core(prompt, model)

noticias = {
    1: {
        "titulo": "Mercados financieros globales en alza",
        "descripcion": "Los mercados financieros globales han experimentado un aumento significativo debido a las expectativas de recuperación económica post-pandemia.",
        "monedas_afectadas": ["USD", "EUR", "JPY"],
        "calificacion_impacto": ["5/10", "6/10", "4/10"]
    },
    2: {
        "titulo": "Aumento de la inflación en EE.UU.",
        "descripcion": "La inflación en EE.UU. ha alcanzado un nuevo máximo en los últimos 12 meses, afectando el poder adquisitivo de los consumidores.",
        "monedas_afectadas": ["USD"],
        "calificacion_impacto": ["7/10"]
    },
    3: {
        "titulo": "Tensiones comerciales entre China y EE.UU.",
        "descripcion": "Las tensiones comerciales entre China y EE.UU. continúan afectando los mercados financieros, con posibles repercusiones en las cadenas de suministro globales.",
        "monedas_afectadas": ["CNY", "USD"],
        "calificacion_impacto": ["6/10", "5/10"]
    },

    4: {
        "titulo": "Innovaciones tecnológicas en fintech",
        "descripcion": "El sector fintech está experimentando un auge en innovaciones tecnológicas que están transformando los servicios financieros.",
        "monedas_afectadas": ["USD", "EUR"],
        "calificacion_impacto": ["4/10", "4/10"]
    },
    5: {
        "titulo": "Políticas monetarias de los bancos centrales",
        "descripcion": "Los bancos centrales están ajustando sus políticas monetarias para abordar la inflación y estimular el crecimiento económico.",
        "monedas_afectadas": ["USD", "EUR", "GBP"],
        "calificacion_impacto": ["6/10", "5/10", "4/10"]
    }

}

@mcp.tool
def noticias_financieras() -> dict:
    return noticias


def financial_strategies_available() -> str:
    return 

if __name__ == "__main__":
    # Servidor MCP por HTTP en http://127.0.0.1:8080/mcp
    mcp.run(transport="http", host="127.0.0.1", port=8080, path="/mcp")


#Prompt que le dice que eres experto en finanzas y en trading de forex y hedging de riesgo de moneda
# le exponemos la tool que sea un json le da las posiciones 
#Otra que le da las noticias recientes
#de las paginas y las estrategias disponibles y otra que le de las noticias financieras mas relevantes del momento.
#Que genere una lista de las acciones a tomar