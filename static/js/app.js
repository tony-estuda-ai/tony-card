document.addEventListener('DOMContentLoaded', function() {
    let modoFocoAtivo = false;

    // 1. BUSCA DADOS DA API
    fetch('/api/dados')
        .then(response => response.json())
        .then(data => {
            const cartoes = data.cartoes || data || [];
            const compras = data.compras || [];

            renderizarCartoes(cartoes);
            renderizarTabela(compras);
            carregarOpcoesFormulario(cartoes);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            document.getElementById('cartoes-grid').innerHTML = '<div class="col-12"><div class="alert alert-danger">Erro ao carregar dados.</div></div>';
        });

    // 2. RENDERIZA OS CARDS
    function renderizarCartoes(cartoes) {
        const grid = document.getElementById('cartoes-grid');
        grid.innerHTML = '';

        const estilosBancos = {
            'credicitrus': { card: 'text-white', bg: 'style="background: linear-gradient(135deg, #004D40 0%, #00796B 100%); border: 1px solid #FF8F00;"', badge: 'bg-warning text-dark', bar: 'bg-warning', text: 'text-white-50', btn: 'btn-outline-light' },
            'itaú': { card: 'bg-white border-start border-warning border-4', bg: '', badge: 'bg-warning text-dark', bar: 'bg-warning', text: 'text-muted', btn: 'btn-outline-warning' },
            'caixa': { card: 'bg-white border-start border-primary border-4', bg: '', badge: 'bg-primary text-white', bar: 'bg-primary', text: 'text-muted', btn: 'btn-outline-primary' },
            'bradesco': { card: 'bg-white border-start border-danger border-4', bg: '', badge: 'bg-danger text-white', bar: 'bg-danger', text: 'text-muted', btn: 'btn-outline-danger' },
            'santander': { card: 'bg-white border-start border-danger border-4', bg: '', badge: 'bg-danger text-white', bar: 'bg-danger', text: 'text-muted', btn: 'btn-outline-danger' },
            'padrao': { card: 'bg-white border', bg: '', badge: 'bg-light text-secondary', bar: 'bg-primary', text: 'text-muted', btn: 'btn-outline-primary' }
        };

        if (!Array.isArray(cartoes) || cartoes.length === 0) {
            grid.innerHTML = '<div class="col-12 text-secondary">Nenhum cartão cadastrado.</div>';
            return;
        }

        cartoes.forEach(cartao => {
            const nome = cartao.nome || cartao.banco || 'Cartão';
            const limiteTotal = cartao.limite_total || cartao.limite || 0;
            const limiteUtilizado = cartao.limite_utilizado || cartao.total_gasto || cartao.gasto_atual || 0;
            const id = cartao.id || '';
            const progresso = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;
            
            const nomeTratado = nome.toLowerCase();
            let config = estilosBancos['padrao'];
            for (let key in estilosBancos) { if (nomeTratado.includes(key)) { config = estilosBancos[key]; break; } }

            const cardHtml = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 card-banco-item" onclick="alternarModoFoco('${id}')" style="cursor: pointer;">
                    <div class="rounded-3 p-3 h-100 shadow-sm ${config.card}" ${config.bg}>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h3 class="h6 mb-0 fw-bold">${nome}</h3>
                            <span class="badge ${config.badge}">#${id}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="small ${config.text}">Gasto</span>
                            <span class="fw-bold">R$ ${limiteUtilizado.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="progress mb-3" style="height: 6px; background-color: rgba(0,0,0,0.1);">
                            <div class="progress-bar ${config.bar}" style="width: ${progresso}%"></div>
                        </div>
                        <button onclick="event.stopPropagation(); editarCartao('${id}', '${nome}', '${limiteTotal}')" class="btn btn-sm ${config.btn} mt-2">Editar</button>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // 3. LÓGICA DO MODO FOCO
    window.alternarModoFoco = function(id) {
        const cards = document.querySelectorAll('.card-banco-item');
        modoFocoAtivo = !modoFocoAtivo;
        cards.forEach(card => {
            const cardId = card.querySelector('.badge').textContent.replace('#', '');
            if (modoFocoAtivo) {
                card.style.display = (cardId !== id) ? 'none' : '';
                if(cardId === id) card.classList.replace('col-lg-3', 'col-lg-12');
            } else {
                card.style.display = '';
                card.classList.replace('col-lg-12', 'col-lg-3');
            }
        });
    }

    // 4. FUNÇÃO DE EDIÇÃO
    window.editarCartao = function(id, bancoAtual, limiteAtual) {
        let novoBanco = prompt("Digite o novo nome do banco:", bancoAtual);
        let novoLimite = prompt("Digite o novo limite total:", limiteAtual);
        if (novoBanco !== null && novoLimite !== null) {
            alert("Edição solicitada para o cartão " + id + ": " + novoBanco + " com limite R$ " + novoLimite);
            // Aqui entra a lógica de salvar no banco de dados posteriormente
        }
    }

    // 5. FUNÇÕES AUXILIARES (Tabela e Seletor)
    function renderizarTabela(compras) {
        const tabela = document.getElementById('compras-tabela');
        if (!tabela) return;
        tabela.innerHTML = compras.map(c => `<tr class="linha-compra-item"><td>${c.data}</td><td>${c.descricao}</td><td>${c.categoria}</td><td>${c.cartao_nome || c.cartao}</td><td>${c.parcelas}</td><td class="text-end fw-bold">R$ ${parseFloat(c.valor).toFixed(2).replace('.', ',')}</td></tr>`).join('');
    }

    function carregarOpcoesFormulario(cartoes) {
        const select = document.getElementById('cartao-compra');
        if (select) select.innerHTML = '<option value="">Selecione o cartão</option>' + cartoes.map(c => `<option value="${c.id}">${c.nome || c.banco}</option>`).join('');
    }
});
