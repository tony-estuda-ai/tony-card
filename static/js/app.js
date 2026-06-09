document.addEventListener('DOMContentLoaded', function() {
    // 1. BUSCA DADOS DA API
    fetch('/api/dados')
        .then(response => response.json())
        .then(data => {
            // Se os dados vierem direto como lista ou dentro de um objeto
            const cartoes = data.cartoes || data || [];
            const compras = data.compras || [];

            renderizarCartoes(cartoes);
            renderizarTabela(compras);
            carregarOpcoesFormulario(cartoes);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            document.getElementById('cartoes-grid').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">Erro ao carregar dados do servidor.</div>
                </div>
            `;
        });

    // 2. RENDERIZA OS CARDS DOS CARTÕES
    function renderizarCartoes(cartoes) {
        const grid = document.getElementById('cartoes-grid');
        grid.innerHTML = '';

        if (!Array.isArray(cartoes) || cartoes.length === 0) {
            grid.innerHTML = '<div class="col-12 text-secondary">Nenhum cartão cadastrado.</div>';
            return;
        }

        cartoes.forEach(cartao => {
            // Garante compatibilidade de nomes de variáveis do backend
            const nome = cartao.nome || cartao.banco || 'Cartão';
            const limiteTotal = cartao.limite_total || cartao.limite || 0;
            const limiteUtilizado = cartao.limite_utilizado || cartao.total_gasto || cartao.gasto_atual || 0;
            const diaFechamento = cartao.dia_fechamento || cartao.fechamento || '-';
            const diaVencimento = cartao.dia_vencimento || cartao.vencimento || '-';
            const id = cartao.id || '';

            const limiteDisponivel = limiteTotal - limiteUtilizado;
            const progresso = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;

            // --- AJUSTE FINO: LÓGICA DE CORES PERSONALIZADAS PARA OS BANCOS ---
            let estiloCard = 'bg-white text-dark border';
            let estiloTextoMuted = 'text-muted';
            let estiloBadge = 'bg-light text-secondary border';
            let estiloBarraProgresso = 'bg-primary';

            const nomeTratado = nome.toLowerCase();

            if (nomeTratado.includes('credicitrus')) {
                // Identidade Credicitrus: Fundo Verde Escuro, texto branco, barra laranja
                estiloCard = 'text-white';
                estiloTextoMuted = 'text-white-50';
                estiloBadge = 'bg-warning text-dark fw-bold'; // Simula o dourado/laranja
                estiloBarraProgresso = 'bg-warning'; // Barra de progresso laranja/amarela
                // Injeta estilo de fundo customizado diretamente via inline style
                var bgCustomizado = 'style="background: linear-gradient(135deg, #004D40 0%, #00796B 100%); border: 1px solid #FF8F00;"';
            } else if (nomeTratado.includes('itau') || nomeTratado.includes('itaú')) {
                estiloCard = 'bg-light text-dark border-start border-orange border-4';
                var bgCustomizado = '';
            } else {
                // Padrão do sistema para os demais bancos
                var bgCustomizado = '';
            }

            const cardHtml = `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3 card-banco-item">
                    <div class="rounded-3 p-3 h-100 shadow-sm ${estiloCard}" ${bgCustomizado}>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h3 class="h6 mb-0 fw-bold">${nome}</h3>
                            <span class="badge ${estiloBadge}">#${id}</span>
                        </div>
                        <p class="${estiloTextoMuted} small mb-3">Fecha dia ${diaFechamento} - Vence dia ${diaVencimento}</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="small ${estiloTextoMuted}">Total gasto</span>
                            <span class="fw-bold">R$ ${limiteUtilizado.toFixed(2).replace('.', ',')}</span>
                        </div>
                        
                        <div class="progress mb-3" style="height: 6px; background-color: rgba(0,0,0,0.1);">
                            <div class="progress-bar ${estiloBarraProgresso}" role="progressbar" style="width: ${progresso}%"></div>
                        </div>

                        <div class="d-flex justify-content-between small mb-1">
                            <span class="${estiloTextoMuted}">Limite Utilizado:</span>
                            <span class="fw-bold">R$ ${limiteUtilizado.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="d-flex justify-content-between small mb-1">
                            <span class="${estiloTextoMuted}">Limite Disponível:</span>
                            <span class="fw-bold ${nomeTratado.includes('credicitrus') ? 'text-warning' : 'text-success'}">R$ ${limiteDisponivel.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="d-flex justify-content-between small">
                            <span class="${estiloTextoMuted}">Limite Total:</span>
                            <span class="fw-bold ${nomeTratado.includes('credicitrus') ? 'text-white-50' : 'text-secondary'}">R$ ${limiteTotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // 3. RENDERIZA A TABELA DE COMPRAS
    function renderizarTabela(compras) {
        const tabela = document.getElementById('compras-tabela');
        tabela.innerHTML = '';

        if (!Array.isArray(compras) || compras.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-secondary py-4">Nenhuma compra encontrada.</td>
                </tr>
            `;
            return;
        }

        compras.forEach(compra => {
            const cartaoNome = compra.cartao_nome || compra.cartao || '';
            const valor = compra.valor || 0;

            const linhaHtml = `
                <tr class="linha-compra-item">
                    <td>${compra.data || ''}</td>
                    <td class="fw-medium">${compra.descricao || ''}</td>
                    <td><span class="badge bg-light text-dark border">${compra.categoria || ''}</span></td>
                    <td>${cartaoNome}</td>
                    <td>${compra.parcelas || '1/1'}</td>
                    <td class="text-end fw-bold text-dark">R$ ${valor.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
            tabela.insertAdjacentHTML('beforeend', linhaHtml);
        });
    }

    // 4. PREENCHE O SELETOR DO MODAL
    function carregarOpcoesFormulario(cartoes) {
        const select = document.getElementById('cartao-compra');
        if (!select) return;
        select.innerHTML = '<option value="">Selecione o cartão</option>';
        if (Array.isArray(cartoes)) {
            cartoes.forEach(cartao => {
                const nome = cartao.nome || cartao.banco || 'Cartão';
                select.insertAdjacentHTML('beforeend', `<option value="${cartao.id}">${nome}</option>`);
            });
        }
    }

    // 5. ESCUTA O FILTRO DE BANCOS DO INDEX.HTML
    const filtro = document.getElementById('filtro-banco');
    if (filtro) {
        filtro.addEventListener('change', function(e) {
            const bancoSelecionado = e.target.value.toLowerCase().trim();
            
            // Filtra os Cards
            const cards = document.querySelectorAll('.card-banco-item');
            cards.forEach(card => {
                const nomeBanco = card.querySelector('h3').textContent.toLowerCase().trim();
                if (bancoSelecionado === "" || nomeBanco.includes(bancoSelecionado)) {
                    card.style.setProperty('display', '', 'important');
                } else {
                    card.style.setProperty('display', 'none', 'important');
                }
            });

            // Filtra as Linhas da Tabela
            const linhas = document.querySelectorAll('.linha-compra-item');
            linhas.forEach(linha => {
                const colunaCartao = linha.cells[3].textContent.toLowerCase().trim();
                if (bancoSelecionado === "" || colunaCartao.includes(bancoSelecionado)) {
                    linha.style.setProperty('display', '', 'important');
                } else {
                    linha.style.setProperty('display', 'none', 'important');
                }
            });
        });
    }
});