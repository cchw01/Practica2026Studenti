from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM

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
        # 1. Căutăm cele mai relevante paragrafe în baza noastră de date
        documente_gasite = vectorstore.similarity_search(mesaj.text, k=3)
        context = "\n".join([doc.page_content for doc in documente_gasite])
        
        # 2. Construim instrucțiunea clară pentru AI
        prompt = f"Folosind DOAR următoarele informații, răspunde la întrebare în limba română.\n\nInformații:\n{context}\n\nÎntrebare: {mesaj.text}\nRăspuns:"
        
        # 3. AI-ul generează răspunsul
        raspuns_ai = llm.invoke(prompt)
        
        return {"raspuns": raspuns_ai}
    except Exception as e:
        return {"raspuns": f"Oups! Am întâmpinat o problemă: {str(e)}"}