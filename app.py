from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os

app = Flask(__name__)
app.secret_key = 'tony_secret_key_2026'

# Caminho para o banco de dados fictício
DATA_FILE = os.path.join(os.path.dirname(__file__), 'dados_ficticios.json')

def carregar_dados():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"cartoes": [], "compras": []}

# Usuários cadastrados
USUARIOS = {
    'tony@teste.com': {'senha': '123', 'nome': 'Tony Conectado'},
    'filha1@teste.com': {'senha': '123', 'nome': 'Filha 1'},
    'filha2@teste.com': {'senha': '123', 'nome': 'Filha 2'}
}

@app.route('/')
def apresentacao():
    return render_template('apresentacao.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        
        if email in USUARIOS and USUARIOS[email]['senha'] == senha:
            session['usuario_logado'] = email
            session['usuario_nome'] = USUARIOS[email]['nome']
            return redirect(url_for('painel'))
        else:
            return render_template('login.html', erro="E-mail ou senha incorretos!")
            
    return render_template('login.html')

@app.route('/painel')
def painel():
    if 'usuario_logado' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', nome=session['usuario_nome'])

# NOVA ROTA: Entrega os dados dos cartões para a tela sumir com a lista vermelha
@app.route('/api/dados')
def api_dados():
    if 'usuario_logado' not in session:
        return jsonify({"erro": "Não autorizado"}), 401
    dados = carregar_dados()
    return jsonify(dados)

@app.route('/sair')
def sair():
    session.clear()
    return redirect(url_for('apresentacao'))

if __name__ == '__main__':
    app.run(debug=True)