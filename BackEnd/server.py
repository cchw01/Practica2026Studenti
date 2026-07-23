import os

# Eliminăm căile invalide de certificate din variabilele de mediu ale sistemului
for _var in ["CURL_CA_BUNDLE", "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE"]:
    _val = os.environ.get(_var)
    if _val and not os.path.exists(_val):
        os.environ.pop(_var, None)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langdetect import detect
from deep_translator import GoogleTranslator

app = FastAPI()

# Permitem aplicației Angular (Frontend) să comunice cu acest server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Încărcăm baza de date și modelul LLM
try:
    vectorstore = Chroma(
        persist_directory="D:/BazaDateAI", 
        embedding_function=OllamaEmbeddings(model="nomic-embed-text")
    )
    llm = OllamaLLM(model="llama3.2")
except Exception as e:
    print(f"Atenție: Baza de date sau modelul nu a putut fi încărcat: {e}")

# Definim formatul mesajului pe care îl primim de la Angular
class MesajUtilizator(BaseModel):
    text: str

# Ruta principală de chat
@app.post("/api/chat")
async def chat(mesaj: MesajUtilizator):
    try:
        text_curatat = mesaj.text.strip()
        if not text_curatat:
            return {"raspuns": "Te rog să introduci o întrebare."}

        # Răspuns direct și amabil pentru saluturi simple
        saluturi_romana = {"buna", "bună", "salut", "hei", "servus", "buna ziua", "bună ziua", "neata", "neața", "buna!", "bună!", "salut!"}
        saluturi_engleza = {"hello", "hi", "hey", "good morning", "good evening", "hello!", "hi!"}
        saluturi_maghiara = {"szia", "sziasztok", "szervusz", "szia!", "sziasztok!"}
        saluturi_internationale = {"ciao", "hola", "bonjour", "hallo", "ola", "ciao!", "hola!"}
        
        text_lower = text_curatat.lower()
        if text_lower in saluturi_romana:
            return {"raspuns": "Bună! 👋 Cu ce te pot ajuta astăzi pe platforma BidSphere?"}
        elif text_lower in saluturi_engleza:
            return {"raspuns": "Hello! 👋 How can I help you today with the BidSphere platform?"}
        elif text_lower in saluturi_maghiara:
            return {"raspuns": "Szia! 👋 Miben segíthetek ma a BidSphere platformon?"}
        elif text_lower in saluturi_internationale:
            return {"raspuns": "Salut! 👋 Cu ce te pot ajuta astăzi pe platforma BidSphere?"}

        # 1. Căutăm cele mai relevante paragrafe în baza noastră de date
        documente_gasite = vectorstore.similarity_search(text_curatat, k=3)
        context = "\n".join([doc.page_content for doc in documente_gasite])
        
        # 3. AI-ul generează răspunsul cu pași clari de navigare și fără amestec de limbi
        prompt = f"""You are an AI support assistant for the BidSphere platform.
Supported languages: German (de), Greek (el), English (en), Spanish (es), French (fr), Hungarian (hu), Italian (it), Polish (pl), Romanian (ro), Slovak (sk), Serbian (sr), Turkish (tr), Ukrainian (uk).

CRITICAL RULES:
1. NAVIGATION INSTRUCTIONS: When the user asks where a page/feature is or how to reach it (e.g. "Where is Help page?"), provide clear STEP-BY-STEP navigation instructions explaining how to access it in the UI (e.g., 1. Click the "Help" button in the top navigation bar, 2. Or scroll down to the footer at the bottom of the page and click the "Help" link). Do NOT just paste a raw URL link without UI navigation steps.
2. LANGUAGE UNMIXING: The documentation context contains text in multiple languages. NEVER mix languages. You MUST write your ENTIRE final response 100% in a single language, matching the exact language of the user's question.

Documentation Context:
{context}

User Question: {text_curatat}
Response:"""
        
        raspuns_final = llm.invoke(prompt)
            
        return {"raspuns": raspuns_final}
    except Exception as e:
        return {"raspuns": f"Oups! Am întâmpinat o problemă: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)