from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings

# 1. Spunem exact unde se află fișierul
cale_fisier = "documente/documentatie.txt"

print(f"Încep citirea fișierului: {cale_fisier}...")

try:
    # 2. Încărcăm textul (folosim utf-8 pentru diacritice)
    loader = TextLoader(cale_fisier, encoding="utf-8")
    documente = loader.load()

    # 3. Tăiem textul în paragrafe pentru a fi ușor de căutat
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    fragmente = text_splitter.split_documents(documente)

    # 4. Creăm baza de date (salvată în D:/BazaDateAI)
    print("Salvez informațiile în baza de date. Te rog așteaptă câteva secunde...")
    vectorstore = Chroma.from_documents(
        documents=fragmente,
        embedding=OllamaEmbeddings(model="nomic-embed-text"),
        persist_directory="D:/BazaDateAI"
    )

    print("Gata! Baza de date a fost creată cu succes! AI-ul știe acum informațiile.")
except Exception as e:
    print(f"A apărut o eroare: {e}")