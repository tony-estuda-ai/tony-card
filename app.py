from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client

app = Flask(__name__)
app.secret_key = 'tony_secret_key_2026'

# --- CONFIGURAÇÃO SUPABASE ---
# Cole a URL que você copiou (começa com https://)
SUPABASE_URL = "https://ymvhewteeeebvytqqbpi.supabase.co"
# Cole a Chave (anon public) que você copiou
SUPABASE_KEY = "sb_publishable_2ux_x8lm-Iv6ZfxxceFmDQ_JcmFLL"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def apresentacao():
    return render_template('apresentacao.html')

@app.route('/api/lista-cartoes')
def api_lista_cartoes():
    # Busca os cartões no banco do Supabase
    response = supabase.table("cartoes").select("*").execute()
    return jsonify({"cartoes": response.data})

@app.route('/api/salvar-despesa', methods=['POST'])
def salvar_despesa():
    nova = request.json
    # Salva a despesa no banco do Supabase
    supabase.table("compras").insert(nova).execute()
    return jsonify({"status": "sucesso"})

if __name__ == '__main__':
    app.run(debug=True)
