from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os

template_dir = os.path.abspath('templates')
app = Flask(__name__, template_folder=template_dir)
app.secret_key = 'tony_secret_key_2026'

DATA_FILE = os.path.join(os.path.dirname(__file__), 'dados_ficticios.json')

def carregar_dados():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"cartoes": [], "compras": []}

def salvar_dados(dados):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)

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

@app.route('/cadastro-despesa')
def pagina_cadastro():
    if 'usuario_logado' not in session:
        return redirect(url_for('login'))
    return render_template('cadastro_despesa.html')

@app.route('/api/salvar-despesa', methods=['POST'])
def salvar_despesa():
    if 'usuario_logado' not in session:
        return jsonify({"erro": "Não autorizado"}), 401
    
    nova = request.json
    dados = carregar_dados()
    
    # Verifica duplicidade
    for compra in dados.get('compras', []):
        if (compra['data'] == nova['data'] and
            compra['descricao'] == nova['descricao'] and
            float(compra['valor']) == float(nova['valor']) and
            str(compra['cartao_id']) == str(nova['cartao_id'])):
            return jsonify({"erro": "Despesa duplicada! Já existe um lançamento idêntico."}), 400

    nova['usuario'] = session['usuario_nome']
    dados['compras'].append(nova)
    salvar_dados(dados)
    return jsonify({"status": "sucesso"})

@app.route('/api/dados')
def api_dados():
    if 'usuario_logado' not in session:
        return jsonify({"erro": "Não autorizado"}), 401
    return jsonify(carregar_dados())

@app.route('/sair')
def sair():
    session.clear()
    return redirect(url_for('apresentacao'))

if __name__ == '__main__':
    app.run(debug=True)
