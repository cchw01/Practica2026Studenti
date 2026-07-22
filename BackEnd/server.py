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
    allow_origins=["http://localhost:4200"], 
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
        # 1. Detectăm automat limba în care a scris utilizatorul
        try:
            limba_detectata = detect(mesaj.text)
        except:
            limba_detectata = 'ro' # Dacă pui doar semne de punctuație, asumată ca română
            
        # 2. Căutăm cele mai relevante paragrafe în baza noastră de date
        documente_gasite = vectorstore.similarity_search(mesaj.text, k=3)
        context = "\n".join([doc.page_content for doc in documente_gasite])
        
        # 3. AI-ul generează răspunsul din documentație în română
        prompt = f"""Folosind DOAR următoarele informații, răspunde clar și direct la întrebare.
        Informații: {context}
        Întrebare: {mesaj.text}
        Răspuns:"""
        
        raspuns_romana = llm.invoke(prompt)
        
        # 4. Traducem răspunsul folosind Google Translate (deep-translator)
        if limba_detectata != 'ro':
            translator = GoogleTranslator(source='ro', target=limba_detectata)
            raspuns_final = translator.translate(raspuns_romana)
        else:
            raspuns_final = raspuns_romana
            
        return {"raspuns": raspuns_final}
    except Exception as e:
        return {"raspuns": f"Oups! Am întâmpinat o problemă: {str(e)}"}