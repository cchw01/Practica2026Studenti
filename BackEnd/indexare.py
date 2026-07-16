import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

# 1. Încărcăm documentele din folderul 'documente'
# Se va uita după toate fișierele .txt din folderul 'documente'
# Modifică această linie în indexare.py
loader = DirectoryLoader('./documente', glob="**/*.txt", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
docs = loader.load()

# 2. Împărțim documentele în bucăți mici (pentru a fi mai ușor de citit de AI)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
splits = text_splitter.split_documents(docs)

# 3. Creăm baza de date vectorială (Chromadb)
# Datele vor fi salvate pe discul D: pentru a economisi spațiu pe C:
vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=OllamaEmbeddings(model="llama3"),
    persist_directory="D:/BazaDateAI" 
)

print("Indexare completă! Documentele au fost salvate în D:/BazaDateAI")