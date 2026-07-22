from flask import Flask, request, jsonify
from flask_cors import CORS
import ollama

app = Flask(__name__)
# Permitem frontend-ului (Angular) să comunice cu acest backend
CORS(app) 

# Aici îi dăm personalitatea și regulile AI-ului
SYSTEM_PROMPT = """
Ești asistentul virtual oficial al unui site de licitații online. 
Rolul tău este să ajuți utilizatorii cu întrebări legate de licitații, oferte, plăți, regulament și setările profilului.
Răspunde clar, concis, la obiect și pe un ton politicos și profesional.
Dacă nu știi un răspuns, îndrumă utilizatorul să contacteze suportul tehnic.
"""

# Numele modelului pe care îl ai descărcat în Ollama (de ex. 'llama3' sau 'mistral')
AI_MODEL = 'llama3'

@app.route('/api/chat', methods=['POST'])
def chat():
    # Primim datele de la frontend (Angular)
    data = request.json
    user_message = data.get('message', '')

    # Verificăm dacă mesajul este gol
    if not user_message:
        return jsonify({'error': 'Mesajul lipsește'}), 400

    try:
        # Trimitem istoricul/mesajul către Ollama
        response = ollama.chat(model=AI_MODEL, messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT},
            {'role': 'user', 'content': user_message}
        ])
        
        # Extragem răspunsul generat de AI
        bot_reply = response['message']['content']
        
        # Trimitem răspunsul înapoi către frontend
        return jsonify({'reply': bot_reply})
        
    except Exception as e:
        # În caz de eroare (ex: Ollama nu este pornit), returnăm eroarea
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Pornim serverul pe portul 5000
    app.run(port=5000, debug=True)