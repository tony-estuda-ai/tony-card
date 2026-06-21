from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client
import os

app = Flask(__name__)
app.secret_key = 'tony_secret_key_2026'

# --- CONFIGURAÇÃO SUPABASE ---
SUPABASE_URL = "https://ymvhewteeeebvytqqbpi.supabase.co"
SUPABASE_KEY = "sb_publishable_2ux_x8lm-Iv6ZfxxceFmDQ_JcmFLL"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- ROTAS DO SITE ---
@app.route('/')
def apresentacao():
    return render_template('apresentacao.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/painel')
def painel():
    return render_template('index.html')

# --- ROTAS DA API ---
@app.route('/api/lista-cartoes')
def api_lista_cartoes():
    response = supabase.table("cartoes").select("*").execute()
    return jsonify({"cartoes": response.data})

@app.route('/api/salvar-despesa', methods=['POST'])
def salvar_despesa():
    nova = request.json
    supabase.table("compras").insert(nova).execute()
    return jsonify({"status": "sucesso"})

if __name__ == '__main__':
    app.run(debug=True)
