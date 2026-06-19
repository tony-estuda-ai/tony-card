document.addEventListener('DOMContentLoaded', function() {
    let modoFocoAtivo = false;

    // 1. BUSCA DADOS
    fetch('/api/dados')
        .then(response => response.json())
        .then(data => {
            const cartoes = data.cartoes || data || [];
            const compras = data.compras || [];
            renderizarCartoes(cartoes);
            renderizarTabela(compras);
            carregarOpcoesFormulario(cartoes);
        })
        .catch(error => console.error('Erro ao buscar dados:', error));

    // 2. RENDERIZA CARDS
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
                        <div class="progress mb-3" style="height: 6px; background-color: rgba(0,0,0,0.1);">
                            <div class="progress-bar ${config.bar}" style="width: ${progresso}%"></div>
                        </div>
                        <button onclick="event.stopPropagation(); editarCartao('${id}', '${nome}', '${limiteTotal}')" class="btn btn-sm ${config.btn}">Editar</button>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // 3. MODO FOCO
    window.alternarModoFoco = function(id) {
    // 3. MODO FOCO E FILTRO DE COMPRAS
    window.alternarModoFoco = function(id) {
        const cards = document.querySelectorAll('.card-banco-item');
        const linhasCompras = document.querySelectorAll('#compras-tabela tr');
        
        modoFocoAtivo = !modoFocoAtivo;

        // Filtra os Cards
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

        // Filtra a Tabela de Compras
        linhasCompras.forEach(linha => {
            // Verifica se a linha tem dados (ignora a linha de "Carregando...")
            if (linha.cells.length > 1) {
                // A coluna "Cartao" é a 4ª coluna, ou seja, índice 3 (célula 4)
                const idCartaoNaLinha = linha.cells[3].textContent.trim();
                
                if (modoFocoAtivo) {
                    linha.style.display = (idCartaoNaLinha !== id) ? 'none' : '';
                } else {
                    linha.style.display = '';
                }
            }
        });
    }
    // 4. EDIÇÃO MODAL
    window.editarCartao = function(id, bancoAtual, limiteAtual) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nome').value = bancoAtual;
        document.getElementById('edit-limite').value = limiteAtual;
        var modal = new bootstrap.Modal(document.getElementById('modalEdicao'));
        modal.show();
    }

    window.confirmarEdicao = function() {
        const id = document.getElementById('edit-id').value;
        const novoNome = document.getElementById('edit-nome').value;
        const novoLimite = document.getElementById('edit-limite').value;
        alert("Edição enviada! ID: " + id + ", Nome: " + novoNome + ", Limite: " + novoLimite);
        bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
    };

    function renderizarTabela(compras) { /* Mantém a lógica da tabela */ }
    function carregarOpcoesFormulario(cartoes) { /* Mantém a lógica do select */ }
});
