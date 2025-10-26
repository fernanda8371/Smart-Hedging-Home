# quick_test.py
from MCP.server import _ask_gemini_core
print(_ask_gemini_core("Dame una lista de las 10 noticias financieras mas relevantes del momento."))


# list_models.py
# import os
# from dotenv import load_dotenv
# from google import genai

# load_dotenv()
# client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# for m in client.models.list():
#     # imprime id y qué métodos soporta
#     caps = getattr(m, "supported_generation_methods", None)
#     print(m.name, caps)
