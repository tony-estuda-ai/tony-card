from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os

template_dir = os.path.abspath('templates')
app = Flask(__name__, template_folder=template_dir)
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

@app.route('/api/dados')
def api_dados():
    if 'usuario_logado' not in session:
        return jsonify({"erro": "Não autorizado"}), 401
    dados = carregar_dados()
    return jsonify(dados)

# Rota de atualização (Corrigida e fora do if __name__)
@app.route('/api/atualizar_cartao', methods=['POST'])
def atualizar_cartao():
    if 'usuario_logado' not in session:
        return jsonify({"erro": "Não autorizado"}), 401
    
    dados_recebidos = request.json
    dados = carregar_dados()
    
    cartao_id = str(dados_recebidos.get('id'))
    for cartao in dados['cartoes']:
        if str(cartao.get('id')) == cartao_id:
            cartao['nome'] = dados_recebidos.get('banco')
            cartao['limite_total'] = float(dados_recebidos.get('limite_total'))
            break
            
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)
    
    return jsonify({"status": "sucesso", "mensagem": "Dados atualizados com sucesso!"})

@app.route('/sair')
def sair():
    session.clear()
    return redirect(url_for('apresentacao'))

@app.route('/api/cartoes/editar', methods=['POST'])
def editar_cartao():
    import os
    dados = request.json
    card_id = int(dados.get('id'))
    novo_nome = dados.get('nome')
    novo_limite = float(dados.get('limite'))

    try:
        with open('dados_ficticios.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

        for cartao in data.get('cartoes', []):
            if cartao.get('id') == card_id:
                cartao['nome'] = novo_nome
                cartao['limite'] = novo_limite
                break

        with open('dados_ficticios.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.flush()
            os.fsync(f.fileno())

        return jsonify({'status': 'sucesso'})
    except Exception as e:
        return jsonify({'status': 'erro', 'message': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
