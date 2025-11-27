// ============================================
// ZENBOTANIC E-COMMERCE - SCRIPT.JS
// Atividade 3 - JavaScript Dinâmico
// ============================================

// Aguardar carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacao();
});

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let carrinho = [];
let contadorCliques = 0;
let temaEscuroAtivo = false;

// Elementos DOM
const cartCountEl = document.getElementById('cart-count');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');
const modalCarrinho = document.getElementById('modal-carrinho');
const modalPagamento = document.getElementById('modal-pagamento');
const campoPesquisa = document.getElementById('campo-pesquisa');
const mensagemPesquisa = document.getElementById('mensagem-pesquisa');
const dataHoraEl = document.getElementById('data-hora');
const contadorCliquesEl = document.getElementById('contador-cliques');
const numeroCliquesEl = document.getElementById('numero-cliques');
const btnTema = document.getElementById('btn-tema');
const iconeTema = document.getElementById('icone-tema');

// ============================================
// FUNÇÃO DE INICIALIZAÇÃO
// ============================================

function inicializarAplicacao() {
    inicializarCarrinho();
    inicializarDataHora();
    inicializarContadorCliques();
    inicializarTema();
    inicializarEventListeners();
    inicializarDetecaoMobile();
    inicializarProdutosAPI();
}

/**
 * Inicializa o carrinho de compras
 */
function inicializarCarrinho() {
    atualizarCarrinho();
}

/**
 * Inicializa atualização de data e hora
 */
function inicializarDataHora() {
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
}

/**
 * Inicializa contador de cliques
 */
function inicializarContadorCliques() {
    carregarContadorCliques();
}

/**
 * Inicializa tema (claro/escuro)
 */
function inicializarTema() {
    carregarTema();
}

/**
 * Configura event listeners da aplicação
 */
function inicializarEventListeners() {
    if (campoPesquisa) {
        campoPesquisa.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validarPesquisa();
            }
        });
    }
}

/**
 * Inicializa detecção de dispositivos móveis
 */
function inicializarDetecaoMobile() {
    detectarMobile();
    window.addEventListener('resize', detectarMobile);
}

// ============================================
// FUNCIONALIDADE 1: ALERTA DE CONFIRMAÇÃO AO ADICIONAR AO CARRINHO
// ============================================

function adicionarAoCarrinho(nomeProduto, preco) {
    // Incrementar contador de cliques
    contadorCliques++;
    salvarContadorCliques();
    atualizarExibicaoContador();

    // Exibir alerta de confirmação
    const confirmacao = confirm(`Deseja adicionar "${nomeProduto}" ao carrinho por ${formatarPreco(preco)}?`);

    if (!confirmacao) {
        return; // Usuário cancelou
    }

    // Verifica se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.nome === nomeProduto);

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            nome: nomeProduto,
            preco: preco,
            quantidade: 1
        });
    }

    atualizarCarrinho();

    // Mostra Toast
    toastMsg.textContent = `${nomeProduto} foi adicionado ao carrinho.`;
    toastEl.classList.remove('translate-x-[150%]');
    toastEl.classList.add('translate-x-0');

    // Esconde Toast após 3 segundos
    setTimeout(() => {
        toastEl.classList.remove('translate-x-0');
        toastEl.classList.add('translate-x-[150%]');
    }, 3000);
}

// ============================================
// FUNCIONALIDADE 2: DATA E HORA ATUAL NO RODAPÉ
// ============================================

function atualizarDataHora() {
    if (!dataHoraEl) return;

    const agora = new Date();
    const opcoes = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo'
    };

    const dataHoraFormatada = agora.toLocaleDateString('pt-BR', opcoes);
    dataHoraEl.textContent = `📅 ${dataHoraFormatada}`;
}

// ============================================
// FUNCIONALIDADE 3: MODO CLARO/ESCURO (TEMA)
// ============================================

function alternarTema() {
    temaEscuroAtivo = !temaEscuroAtivo;
    aplicarTema();
    salvarTema();
}

function aplicarTema() {
    const body = document.body;

    if (temaEscuroAtivo) {
        body.classList.add('tema-escuro');
        if (iconeTema) iconeTema.textContent = '☀️';
    } else {
        body.classList.remove('tema-escuro');
        if (iconeTema) iconeTema.textContent = '🌙';
    }
}

function salvarTema() {
    localStorage.setItem('temaEscuro', temaEscuroAtivo);
}

function carregarTema() {
    const temaSalvo = localStorage.getItem('temaEscuro');
    if (temaSalvo === 'true') {
        temaEscuroAtivo = true;
        aplicarTema();
    }
}

// ============================================
// FUNCIONALIDADE 4: VALIDAÇÃO DE CAMPO DE PESQUISA
// ============================================

function validarPesquisa() {
    if (!campoPesquisa || !mensagemPesquisa) return;

    const termoPesquisa = campoPesquisa.value.trim();

    // Validar se está vazio
    if (termoPesquisa === '') {
        mostrarMensagemPesquisa('⚠️ Por favor, digite um termo para pesquisar.', 'erro');
        return false;
    }

    // Validar se tem menos de 2 caracteres
    if (termoPesquisa.length < 2) {
        mostrarMensagemPesquisa('⚠️ Digite pelo menos 2 caracteres para pesquisar.', 'erro');
        return false;
    }

    // Validar se tem mais de 50 caracteres
    if (termoPesquisa.length > 50) {
        mostrarMensagemPesquisa('⚠️ O termo de pesquisa é muito longo. Máximo 50 caracteres.', 'erro');
        return false;
    }

    // Pesquisa válida
    mostrarMensagemPesquisa(`✅ Pesquisando por: "${termoPesquisa}"`, 'sucesso');

    // Simular pesquisa (aqui você pode implementar a lógica real de busca)
    setTimeout(() => {
        ocultarMensagemPesquisa();
        // Aqui você pode adicionar a lógica de filtro de produtos
        alert(`Pesquisa realizada por: "${termoPesquisa}"\n\n(Esta é uma demonstração. Implemente a lógica de busca real aqui.)`);
    }, 1500);

    return true;
}

function mostrarMensagemPesquisa(mensagem, tipo) {
    if (!mensagemPesquisa) return;

    mensagemPesquisa.textContent = mensagem;
    mensagemPesquisa.classList.remove('hidden');

    // Remover classes de tipo anteriores
    mensagemPesquisa.classList.remove('bg-yellow-100', 'border-yellow-400', 'text-yellow-800');
    mensagemPesquisa.classList.remove('bg-green-100', 'border-green-400', 'text-green-800');
    mensagemPesquisa.classList.remove('bg-red-100', 'border-red-400', 'text-red-800');

    // Adicionar classe de tipo
    if (tipo === 'sucesso') {
        mensagemPesquisa.classList.add('bg-green-100', 'border-green-400', 'text-green-800');
    } else if (tipo === 'erro') {
        mensagemPesquisa.classList.add('bg-red-100', 'border-red-400', 'text-red-800');
    } else {
        mensagemPesquisa.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-800');
    }
}

function ocultarMensagemPesquisa() {
    if (mensagemPesquisa) {
        mensagemPesquisa.classList.add('hidden');
    }
}

// ============================================
// FUNCIONALIDADE 5: CONTADOR DE CLIQUES
// ============================================

function atualizarExibicaoContador() {
    if (contadorCliquesEl && numeroCliquesEl) {
        if (contadorCliques > 0) {
            contadorCliquesEl.classList.remove('hidden');
            numeroCliquesEl.textContent = contadorCliques;
        }
    }
}

function salvarContadorCliques() {
    localStorage.setItem('contadorCliques', contadorCliques.toString());
}

function carregarContadorCliques() {
    const contadorSalvo = localStorage.getItem('contadorCliques');
    if (contadorSalvo) {
        contadorCliques = parseInt(contadorSalvo) || 0;
        atualizarExibicaoContador();
    }
}

// ============================================
// FUNÇÕES AUXILIARES DO CARRINHO
// ============================================

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function atualizarQuantidade(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) {
        removerDoCarrinho(index);
    } else {
        atualizarCarrinho();
    }
}

function atualizarCarrinho() {
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    const totalPreco = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    // Atualiza contador no header
    if (totalItens > 0) {
        if (cartCountEl) {
            cartCountEl.textContent = totalItens;
            cartCountEl.classList.remove('hidden');
        }
    } else {
        if (cartCountEl) {
            cartCountEl.classList.add('hidden');
        }
    }

    // Atualiza lista de itens no modal
    const carrinhoItens = document.getElementById('carrinho-itens');
    const carrinhoTotal = document.getElementById('carrinho-total');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (carrinho.length === 0) {
        if (carrinhoItens) {
            carrinhoItens.innerHTML = `
                <div class="text-center py-12 text-stone-400">
                    <i class="ph ph-shopping-cart text-5xl mb-4"></i>
                    <p class="text-lg">Seu carrinho está vazio</p>
                </div>
            `;
        }
        if (btnFinalizar) btnFinalizar.disabled = true;
    } else {
        if (carrinhoItens) {
            carrinhoItens.innerHTML = carrinho.map((item, index) => `
                <div class="flex items-center justify-between p-4 bg-stone-50 rounded-lg mb-3">
                    <div class="flex-1">
                        <h4 class="font-bold text-stone-800">${item.nome}</h4>
                        <p class="text-sm text-stone-600">${formatarPreco(item.preco)} cada</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="atualizarQuantidade(${index}, -1)" class="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center">
                            <i class="ph ph-minus text-sm"></i>
                        </button>
                        <span class="font-bold w-8 text-center">${item.quantidade}</span>
                        <button onclick="atualizarQuantidade(${index}, 1)" class="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center">
                            <i class="ph ph-plus text-sm"></i>
                        </button>
                        <span class="font-bold text-green-700 w-24 text-right">${formatarPreco(item.preco * item.quantidade)}</span>
                        <button onclick="removerDoCarrinho(${index})" class="text-red-500 hover:text-red-700 ml-2">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        if (btnFinalizar) btnFinalizar.disabled = false;
    }

    if (carrinhoTotal) {
        carrinhoTotal.textContent = formatarPreco(totalPreco);
    }
}

// ============================================
// FUNÇÕES DE MODAL
// ============================================

function abrirCarrinho() {
    if (modalCarrinho) {
        modalCarrinho.classList.add('active');
    }
}

function fecharCarrinho() {
    if (modalCarrinho) {
        modalCarrinho.classList.remove('active');
    }
}

function abrirPagamento() {
    if (carrinho.length === 0) return;
    fecharCarrinho();
    const totalPreco = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const totalPagamentoEl = document.getElementById('total-pagamento');
    if (totalPagamentoEl) {
        totalPagamentoEl.textContent = formatarPreco(totalPreco);
    }
    if (modalPagamento) {
        modalPagamento.classList.add('active');
    }
}

function fecharPagamento() {
    if (modalPagamento) {
        modalPagamento.classList.remove('active');
    }
}

// Fechar modais ao clicar fora
window.onclick = function(event) {
    if (event.target === modalCarrinho) {
        fecharCarrinho();
    }
    if (event.target === modalPagamento) {
        fecharPagamento();
    }
    const modalMobile = document.getElementById('modal-mobile');
    if (event.target === modalMobile) {
        fecharModalMobile();
    }
}

// ============================================
// FUNÇÕES DE PAGAMENTO
// ============================================

function processarPagamento(event) {
    event.preventDefault();

    const tipoCartao = document.querySelector('input[name="tipo-cartao"]:checked');
    const numeroCartao = document.getElementById('numero-cartao');
    const validade = document.getElementById('validade');
    const cvv = document.getElementById('cvv');
    const nomeCartao = document.getElementById('nome-cartao');
    const parcelas = document.getElementById('parcelas');

    if (!tipoCartao || !numeroCartao || !validade || !cvv || !nomeCartao || !parcelas) {
        return;
    }

    // Simulação de processamento
    const tipo = tipoCartao.value === 'credito' ? 'Crédito' : 'Débito';
    toastMsg.textContent = `Pagamento processado com sucesso! ${tipo} em ${parcelas.value}x`;
    toastEl.classList.remove('translate-x-[150%]');
    toastEl.classList.add('translate-x-0');

    setTimeout(() => {
        toastEl.classList.remove('translate-x-0');
        toastEl.classList.add('translate-x-[150%]');
    }, 5000);

    // Limpa o carrinho
    carrinho = [];
    atualizarCarrinho();
    fecharPagamento();

    // Reseta o formulário
    const formPagamento = document.getElementById('form-pagamento');
    if (formPagamento) {
        formPagamento.reset();
    }
}

// Máscaras de input
document.addEventListener('DOMContentLoaded', function() {
    const numeroCartao = document.getElementById('numero-cartao');
    const validade = document.getElementById('validade');
    const cvv = document.getElementById('cvv');

    if (numeroCartao) {
        numeroCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            value = value.match(/.{1,4}/g) ? value.match(/.{1,4}/g).join(' ') : value;
            e.target.value = value;
        });
    }

    if (validade) {
        validade.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvv) {
        cvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
});

// ============================================
// FUNÇÕES DE COMPARTILHAMENTO E MOBILE
// ============================================

const modalMobile = document.getElementById('modal-mobile');

function abrirModalMobile() {
    if (modalMobile) {
        modalMobile.classList.add('active');
        setTimeout(() => {
            gerarQRCode();
        }, 100);
    }
}

function fecharModalMobile() {
    if (modalMobile) {
        modalMobile.classList.remove('active');
    }
}

function gerarQRCode() {
    const qrCodePlaceholder = document.getElementById('qr-code-placeholder');
    if (!qrCodePlaceholder) return;
    
    // Usar URL atual para QR Code (lógica de domínio fica no backend)
    const urlAtual = window.location.href;
    let urlParaQRCode = urlAtual;
    
    // Se for arquivo local, usar URL atual (backend resolve o domínio)
    // Se já estiver online, usar URL atual
    if (urlAtual.startsWith('file:///')) {
        // Para arquivos locais, usar URL atual (backend deve fornecer URL correta)
        urlParaQRCode = urlAtual;
    }

    qrCodePlaceholder.innerHTML = '';
    qrCodePlaceholder.style.padding = '10px';
    qrCodePlaceholder.style.display = 'flex';
    qrCodePlaceholder.style.justifyContent = 'center';
    qrCodePlaceholder.style.alignItems = 'center';

    const canvas = document.createElement('canvas');
    qrCodePlaceholder.appendChild(canvas);

    try {
        if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
            QRCode.toCanvas(canvas, urlParaQRCode, {
                width: 250,
                margin: 2,
                color: { dark: '#1b5e20', light: '#ffffff' },
                errorCorrectionLevel: 'M'
            }, function(error) {
                if (error) {
                    gerarQRCodeAlternativo(urlParaQRCode);
                } else {
                    canvas.style.borderRadius = '10px';
                    canvas.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
                }
            });
        } else {
            gerarQRCodeAlternativo(urlParaQRCode);
        }
    } catch (e) {
        gerarQRCodeAlternativo(urlParaQRCode);
    }
}

function gerarQRCodeAlternativo(url) {
    const qrCodePlaceholder = document.getElementById('qr-code-placeholder');
    if (!qrCodePlaceholder) return;

    const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(url) + '&color=1b5e20&bgcolor=ffffff&margin=2';
    const img = document.createElement('img');
    img.src = qrCodeUrl;
    img.alt = 'QR Code para ' + url;
    img.style.width = '250px';
    img.style.height = '250px';
    img.style.borderRadius = '10px';
    img.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    img.style.border = '4px solid #1b5e20';

    img.onerror = function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2U4ZjVlOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMxYjVlMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5GxIFFSIENvZGU8L3RleHQ+PC9zdmc+';
    };

    qrCodePlaceholder.innerHTML = '';
    qrCodePlaceholder.appendChild(img);
}

function obterURLCompartilhamento() {
    // Retorna URL atual para compartilhamento (backend resolve domínio)
    return window.location.href;
}

function compartilharSite() {
    const urlCompartilhamento = obterURLCompartilhamento();
    if (navigator.share) {
        navigator.share({
            title: 'ZenBotanic - E-commerce de Plantas',
            text: 'Confira as plantas incríveis da ZenBotanic!',
            url: urlCompartilhamento
        }).catch(err => {
            copiarLink();
        });
    } else {
        copiarLink();
    }
}

function copiarLink() {
    const urlCompartilhamento = obterURLCompartilhamento();
    copiarTextoParaAreaTransferencia(urlCompartilhamento);
}

function copiarLinkCompleto() {
    const urlCompartilhamento = obterURLCompartilhamento();
    copiarTextoParaAreaTransferencia(urlCompartilhamento);
    const feedback = document.getElementById('link-copiado-feedback');
    if (feedback) {
        feedback.classList.remove('hidden');
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 3000);
    }
}

function copiarTextoParaAreaTransferencia(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast('✅ Link copiado! Cole onde quiser compartilhar.');
        }).catch(() => {
            copiarTextoFallback(texto);
        });
    } else {
        copiarTextoFallback(texto);
    }
}

function copiarTextoFallback(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        mostrarToast('✅ Link copiado!');
    } catch (err) {
        mostrarToast('❌ Erro ao copiar. Tente selecionar e copiar manualmente.');
    }
    document.body.removeChild(textarea);
}

function compartilharWhatsApp() {
    const urlCompartilhamento = obterURLCompartilhamento();
    const texto = '🌿 Confira o ZenBotanic - E-commerce de plantas incríveis! ' + urlCompartilhamento;
    const urlWhatsApp = 'https://wa.me/?text=' + encodeURIComponent(texto);
    window.open(urlWhatsApp, '_blank');
}

function enviarSMS() {
    const urlCompartilhamento = obterURLCompartilhamento();
    const texto = 'Confira o ZenBotanic: ' + urlCompartilhamento;
    const urlSMS = 'sms:?body=' + encodeURIComponent(texto);
    window.location.href = urlSMS;
}

function mostrarToast(mensagem) {
    if (toastMsg && toastEl) {
        toastMsg.textContent = mensagem;
        toastEl.classList.remove('translate-x-[150%]');
        toastEl.classList.add('translate-x-0');
        setTimeout(() => {
            toastEl.classList.remove('translate-x-0');
            toastEl.classList.add('translate-x-[150%]');
        }, 3000);
    }
}

function detectarMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
    if (isMobile) {
        setTimeout(() => {
            mostrarBannerCompartilhar();
        }, 2000);
    }
}

// Função para obter IP local
function obterIPLocal() {
    return new Promise((resolve) => {
        const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!RTCPeerConnection) {
            resolve(null);
            return;
        }

        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidate = event.candidate.candidate;
                const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                if (match && !match[1].startsWith('127.') && !match[1].startsWith('169.254.')) {
                    pc.close();
                    resolve(match[1]);
                }
            }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        setTimeout(() => {
            pc.close();
            resolve(null);
        }, 1000);
    });
}

// Função para obter URL local
async function obterURLLocal() {
    const urlAtual = window.location.href;

    if (urlAtual.match(/http:\/\/\d+\.\d+\.\d+\.\d+/)) {
        return urlAtual;
    }

    if (urlAtual.includes('localhost') || urlAtual.includes('127.0.0.1') || urlAtual.startsWith('file:///')) {
        const ip = await obterIPLocal();
        if (ip) {
            const nomeArquivo = urlAtual.split('/').pop() || 'zenbotanic-ecommerce.html';
            let porta = '8000';
            const matchPorta = urlAtual.match(/:(\d+)/);
            if (matchPorta) {
                porta = matchPorta[1];
            }
            return `http://${ip}:${porta}/${nomeArquivo}`;
        }
    }

    return null;
}

// Função para copiar URL local
async function copiarURLLocal() {
    const urlLocal = await obterURLLocal();
    if (urlLocal) {
        copiarTextoParaAreaTransferencia(urlLocal);
        mostrarToast('✅ Link local copiado! Use no outro PC na mesma rede Wi-Fi.');
    } else {
        mostrarToast('⚠️ Execute o servidor local primeiro (iniciar-servidor.bat)');
    }
}

// Função para abrir modal mobile (simplificada - sem informações técnicas)
function abrirModalMobile() {
    if (modalMobile) {
        modalMobile.classList.add('active');
        
        // Gerar QR Code automaticamente (lógica de domínio fica no backend)
        setTimeout(() => {
            gerarQRCode();
        }, 100);
    }
}

// Funções do banner de compartilhamento
function mostrarBannerCompartilhar() {
    const banner = document.getElementById('banner-compartilhar');
    const bannerUrl = document.getElementById('banner-url');
    if (banner && bannerUrl) {
        const urlCompartilhamento = obterURLCompartilhamento();
        bannerUrl.textContent = urlCompartilhamento;
        banner.classList.remove('-translate-y-full');
    }
}

function fecharBannerCompartilhar() {
    const banner = document.getElementById('banner-compartilhar');
    if (banner) {
        banner.classList.add('-translate-y-full');
    }
}

// ============================================
// ATIVIDADE FINAL - CONSUMO DE API PÚBLICA
// ============================================

/**
 * Configurações da API
 */
const API_CONFIG = {
    BASE_URL: 'https://fakestoreapi.com',
    ENDPOINTS: {
        PRODUCTS: '/products',
        CATEGORIES: '/products/categories'
    },
    LIMIT: 6 // Limitar a 6 produtos para não sobrecarregar
};

/**
 * Busca produtos da API Fake Store
 * @returns {Promise<Array>} Array de produtos
 */
async function buscarProdutosDaAPI() {
    try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}?limit=${API_CONFIG.LIMIT}`;
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro ao buscar produtos: ${resposta.status}`);
        }

        const produtos = await resposta.json();
        return produtos;
    } catch (erro) {
        console.error('Erro ao buscar produtos da API:', erro);
        mostrarMensagemErroAPI('Não foi possível carregar produtos da API. Tente novamente mais tarde.');
        return [];
    }
}

/**
 * Traduz categoria para português brasileiro
 * @param {string} categoria - Categoria em inglês
 * @returns {string} Categoria traduzida
 */
function traduzirCategoria(categoria) {
    const traducoes = {
        "electronics": "Eletrônicos",
        "jewelery": "Joias",
        "men's clothing": "Roupas Masculinas",
        "women's clothing": "Roupas Femininas"
    };
    return traducoes[categoria.toLowerCase()] || categoria;
}

/**
 * Traduz descrição para português brasileiro
 * @param {string} descricao - Descrição em inglês
 * @returns {string} Descrição traduzida
 */
function traduzirDescricao(descricao) {
    if (!descricao) {
        return 'Produto de qualidade premium da nossa loja. Perfeito para seu estilo e necessidades.';
    }
    
    // Descrições traduzidas baseadas nos produtos comuns da API
    const descricoesTraduzidas = {
        // Mochilas e acessórios
        "backpack": "Mochila prática e resistente, perfeita para o dia a dia. Design moderno e funcional.",
        "foldsack": "Mochila espaçosa com múltiplos compartimentos. Ideal para trabalho e viagens.",
        
        // Roupas masculinas
        "men's": "Peça masculina de alta qualidade. Confortável e estilosa para qualquer ocasião.",
        "slim fit": "Corte slim fit que valoriza o corpo. Tecido de qualidade premium.",
        "cotton": "Feito em algodão macio e respirável. Conforto garantido durante todo o dia.",
        
        // Roupas femininas
        "women's": "Peça feminina elegante e moderna. Perfeita para destacar seu estilo único.",
        "removable": "Design versátil com capuz removível. Adaptável a diferentes estilos.",
        
        // Eletrônicos
        "hard drive": "Armazenamento confiável e rápido. Perfeito para backup e expansão de capacidade.",
        "ssd": "SSD de alta performance. Velocidade e confiabilidade para seus dados importantes.",
        "monitor": "Monitor de alta qualidade com excelente resolução. Ideal para trabalho e entretenimento.",
        "gaming": "Equipamento gaming de última geração. Performance excepcional para jogos.",
        
        // Joias
        "gold": "Joia em ouro de alta qualidade. Design elegante e atemporal.",
        "silver": "Acessório em prata com acabamento impecável. Perfeito para presentear.",
        "bracelet": "Pulseira delicada e sofisticada. Adicione um toque de elegância ao seu visual."
    };
    
    // Verificar palavras-chave e retornar descrição apropriada
    const descricaoLower = descricao.toLowerCase();
    
    if (descricaoLower.includes('backpack') || descricaoLower.includes('foldsack')) {
        return "Mochila prática e resistente, perfeita para o dia a dia. Design moderno e funcional com múltiplos compartimentos.";
    }
    
    if (descricaoLower.includes("men's") && descricaoLower.includes("shirt")) {
        return "Camiseta masculina de alta qualidade em algodão. Corte slim fit que valoriza o corpo. Confortável e estilosa para qualquer ocasião.";
    }
    
    if (descricaoLower.includes("women's") && descricaoLower.includes("jacket")) {
        return "Jaqueta feminina elegante e moderna. Design versátil com capuz removível. Perfeita para destacar seu estilo único.";
    }
    
    if (descricaoLower.includes("hard drive") || descricaoLower.includes("ssd")) {
        return "Armazenamento confiável e rápido. Perfeito para backup e expansão de capacidade. Alta performance e durabilidade.";
    }
    
    if (descricaoLower.includes("monitor")) {
        return "Monitor de alta qualidade com excelente resolução e cores vibrantes. Ideal para trabalho, estudos e entretenimento.";
    }
    
    if (descricaoLower.includes("bracelet") || descricaoLower.includes("jewelry")) {
        return "Joia elegante e sofisticada. Design atemporal com acabamento impecável. Perfeita para presentear ou presentear-se.";
    }
    
    // Descrição genérica traduzida
    return "Produto de qualidade premium da nossa loja. Confortável, durável e perfeito para seu estilo e necessidades. Garantia de satisfação.";
}

/**
 * Traduz título do produto para português brasileiro
 * @param {string} titulo - Título em inglês
 * @returns {string} Título traduzido
 */
function traduzirTitulo(titulo) {
    // Mapeamento de produtos comuns da Fake Store API
    const traducoes = {
        "Fjallraven - Foldsack No. 1 Backpack": "Mochila Fjallraven Foldsack No. 1",
        "Mens Casual Premium Slim Fit T-Shirts": "Camiseta Masculina Premium Slim Fit",
        "Mens Cotton Jacket": "Jaqueta Masculina de Algodão",
        "Mens Casual Slim Fit": "Roupa Casual Masculina Slim Fit",
        "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet": "Pulseira John Hardy Legends Naga Ouro e Prata Dragão",
        "Solid Gold Petite Micropave": "Joia em Ouro Maciço Petite Micropave",
        "White Gold Plated Princess": "Princesa Banhada em Ouro Branco",
        "Pierced Owl Rose Gold Plated Stainless Steel Double": "Coruja Perfurada Dupla Aço Inoxidável Banhado Ouro Rosa",
        "WD 2TB Elements Portable External Hard Drive": "HD Externo Portátil WD Elements 2TB",
        "SanDisk SSD PLUS 1TB Internal SSD": "SSD Interno SanDisk PLUS 1TB",
        "Silicon Power 256GB SSD 3D NAND A55": "SSD Silicon Power 256GB 3D NAND A55",
        "WD 4TB Gaming Drive Works with Playstation 4": "HD Gaming WD 4TB Compatível com PlayStation 4",
        "Acer SB220Q bi 21.5 inches Full HD": "Monitor Acer SB220Q bi 21.5 polegadas Full HD",
        "Samsung 49-Inch CHG90 QLED Gaming Monitor": "Monitor Gaming Samsung 49 Polegadas CHG90 QLED",
        "BIYLACLESEN Women's 3-in-1 Snowboard Jacket": "Jaqueta de Esqui Feminina 3 em 1 BIYLACLESEN",
        "Lock and Love Women's Removable Hooded Faux Leather": "Jaqueta Feminina com Capuz Removível Faux Leather",
        "Rain Jacket Women Windbreaker Striped Climbing": "Jaqueta Impermeável Feminina Windbreaker Listrada",
        "MBJ Women's Solid Short Sleeve Boat Neck V": "Blusa Feminina Manga Curta Gola Barco MBJ",
        "Opna Women's Short Sleeve Moisture": "Blusa Feminina Manga Curta Opna",
        "DANVOUY Womens T Shirt Casual Cotton Short": "Camiseta Feminina Casual Algodão DANVOUY"
    };
    
    // Verificar se há tradução específica
    if (traducoes[titulo]) {
        return traducoes[titulo];
    }
    
    // Tradução genérica baseada em palavras-chave
    let tituloTraduzido = titulo;
    
    // Traduzir palavras comuns
    tituloTraduzido = tituloTraduzido.replace(/Men's/gi, "Masculino");
    tituloTraduzido = tituloTraduzido.replace(/Women's/gi, "Feminino");
    tituloTraduzido = tituloTraduzido.replace(/Casual/gi, "Casual");
    tituloTraduzido = tituloTraduzido.replace(/Premium/gi, "Premium");
    tituloTraduzido = tituloTraduzido.replace(/Slim Fit/gi, "Slim Fit");
    tituloTraduzido = tituloTraduzido.replace(/Cotton/gi, "Algodão");
    tituloTraduzido = tituloTraduzido.replace(/Leather/gi, "Couro");
    tituloTraduzido = tituloTraduzido.replace(/Jacket/gi, "Jaqueta");
    tituloTraduzido = tituloTraduzido.replace(/T-Shirt/gi, "Camiseta");
    tituloTraduzido = tituloTraduzido.replace(/Shirt/gi, "Camisa");
    tituloTraduzido = tituloTraduzido.replace(/Backpack/gi, "Mochila");
    tituloTraduzido = tituloTraduzido.replace(/Bracelet/gi, "Pulseira");
    tituloTraduzido = tituloTraduzido.replace(/Hard Drive/gi, "HD");
    tituloTraduzido = tituloTraduzido.replace(/SSD/gi, "SSD");
    tituloTraduzido = tituloTraduzido.replace(/Monitor/gi, "Monitor");
    tituloTraduzido = tituloTraduzido.replace(/Gaming/gi, "Gaming");
    
    return tituloTraduzido;
}

/**
 * Converte produto da API para formato interno com tradução para PT-BR
 * @param {Object} produtoAPI - Produto da API
 * @returns {Object} Produto formatado em português brasileiro
 */
function formatarProdutoDaAPI(produtoAPI) {
    const tituloTraduzido = traduzirTitulo(produtoAPI.title);
    const categoriaTraduzida = traduzirCategoria(produtoAPI.category);
    const descricaoTraduzida = traduzirDescricao(produtoAPI.description);
    
    return {
        id: produtoAPI.id,
        nome: tituloTraduzido.length > 50 ? tituloTraduzido.substring(0, 50) + '...' : tituloTraduzido,
        preco: produtoAPI.price,
        imagem: produtoAPI.image,
        categoria: categoriaTraduzida,
        descricao: descricaoTraduzida,
        rating: produtoAPI.rating || { rate: 0, count: 0 }
    };
}

/**
 * Cria elemento HTML de card de produto da API
 * @param {Object} produto - Produto formatado
 * @returns {HTMLElement} Elemento HTML do card
 */
function criarCardProdutoAPI(produto) {
    const article = document.createElement('article');
    article.className = 'flip-card group cursor-pointer';
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', `Produto: ${produto.nome}`);

    const precoFormatado = formatarPreco(produto.preco);
    const estrelas = Math.round(produto.rating.rate);
    const estrelasHTML = '⭐'.repeat(estrelas) + '☆'.repeat(5 - estrelas);

    article.innerHTML = `
        <div class="flip-card-inner">
            <!-- FRENTE -->
            <div class="flip-card-front shadow-lg flex flex-col">
                <div class="h-64 overflow-hidden bg-stone-100">
                    <img src="${produto.imagem}" 
                         alt="${produto.nome}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/500x500?text=Produto'">
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between text-left">
                    <div>
                        <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">${produto.categoria}</span>
                        <h3 class="text-xl font-bold text-stone-900 mt-1">${produto.nome}</h3>
                        <p class="text-stone-500 text-sm mt-2">${produto.descricao.substring(0, 80)}...</p>
                        <div class="mt-2 text-sm text-yellow-600">${estrelasHTML} (${produto.rating.count})</div>
                    </div>
                    <div class="mt-4 text-2xl font-bold text-green-700">${precoFormatado}</div>
                </div>
            </div>
            <!-- VERSO -->
            <div class="flip-card-back shadow-xl">
                <i class="ph ph-shopping-bag text-4xl mb-2 text-yellow-300"></i>
                <h4 class="font-bold text-xl mb-2">Detalhes</h4>
                <p class="text-sm text-center mb-6 px-4 text-green-100">${produto.descricao.substring(0, 120)}...</p>
                <div class="flex gap-2 mb-6 justify-center">
                    <span class="px-2 py-1 bg-green-700 rounded text-xs">${produto.categoria}</span>
                    <span class="px-2 py-1 bg-green-700 rounded text-xs">⭐ ${produto.rating.rate}</span>
                </div>
                <button onclick="adicionarAoCarrinho('${produto.nome.replace(/'/g, "\\'")}', ${produto.preco})" 
                        class="btn-comprar bg-white text-green-900 hover:bg-stone-100 font-bold py-3 px-8 rounded-full shadow-md flex items-center gap-2 mx-auto"
                        aria-label="Adicionar ${produto.nome} ao carrinho">
                    <i class="ph ph-shopping-bag"></i>
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `;

    return article;
}

/**
 * Renderiza produtos da API no DOM
 * @param {Array} produtos - Array de produtos formatados
 */
function renderizarProdutosAPI(produtos) {
    const container = document.getElementById('container-produtos-api');

    if (!container) {
        console.error('Container de produtos da API não encontrado');
        return;
    }

    if (produtos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-stone-500">Nenhum produto disponível no momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    produtos.forEach(produto => {
        const card = criarCardProdutoAPI(produto);
        container.appendChild(card);
    });
}

/**
 * Exibe mensagem de erro ao usuário
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarMensagemErroAPI(mensagem) {
    const container = document.getElementById('container-produtos-api');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-red-50 rounded-lg border-2 border-red-200">
                <p class="text-red-600 font-medium">${mensagem}</p>
            </div>
        `;
    }
}

/**
 * Inicializa carregamento de produtos da API
 */
async function inicializarProdutosAPI() {
    const container = document.getElementById('container-produtos-api');

    if (!container) {
        return; // Container não existe, não fazer nada
    }

    // Mostrar loading
    container.innerHTML = `
        <div class="col-span-full text-center py-12">
            <div class="inline-block animate-spin text-4xl mb-4">🌿</div>
            <p class="text-stone-500">Carregando produtos da API...</p>
        </div>
    `;

    try {
        const produtosAPI = await buscarProdutosDaAPI();
        const produtosFormatados = produtosAPI.map(formatarProdutoDaAPI);
        renderizarProdutosAPI(produtosFormatados);
    } catch (erro) {
        console.error('Erro ao inicializar produtos da API:', erro);
        mostrarMensagemErroAPI('Erro ao carregar produtos. Tente recarregar a página.');
    }
}

// A inicialização de produtos da API é chamada em inicializarAplicacao()

// ============================================
// REFLEXÃO SOBRE CLEAN CODE
// ============================================

/*
 * REFLEXÃO SOBRE APLICAÇÃO DE CLEAN CODE
 * ======================================
 * 
 * PRINCÍPIOS APLICADOS:
 * 
 * 1. NOMES SIGNIFICATIVOS:
 *    - Funções e variáveis com nomes descritivos (ex: buscarProdutosDaAPI, formatarProdutoDaAPI)
 *    - Evitei abreviações confusas
 *    - Usei nomes que expressam a intenção do código
 * 
 * 2. FUNÇÕES PEQUENAS E COM RESPONSABILIDADE ÚNICA:
 *    - Cada função faz uma coisa bem feita
 *    - Separei responsabilidades: buscar dados, formatar, renderizar
 *    - Funções curtas e fáceis de entender
 * 
 * 3. COMENTÁRIOS ÚTEIS:
 *    - Comentários explicam o "porquê", não o "o quê"
 *    - Documentação JSDoc para funções importantes
 *    - Comentários de seção para organização
 * 
 * 4. TRATAMENTO DE ERROS:
 *    - Try/catch para operações assíncronas
 *    - Mensagens de erro claras para o usuário
 *    - Fallbacks quando necessário
 * 
 * 5. ORGANIZAÇÃO E ESTRUTURA:
 *    - Código organizado em seções lógicas
 *    - Constantes agrupadas (API_CONFIG)
 *    - Funções relacionadas próximas umas das outras
 * 
 * 6. EVITAR DUPLICAÇÃO:
 *    - Funções reutilizáveis (formatarPreco, mostrarToast)
 *    - Código DRY (Don't Repeat Yourself)
 * 
 * 7. ACESSIBILIDADE:
 *    - Atributos aria-label nos elementos interativos
 *    - Alt text nas imagens
 *    - Tabindex para navegação por teclado
 * 
 * O QUE AINDA PODE MELHORAR:
 * 
 * 1. MODULARIZAÇÃO:
 *    - Separar em múltiplos arquivos (api.js, carrinho.js, ui.js)
 *    - Usar módulos ES6 para melhor organização
 * 
 * 2. TESTES:
 *    - Adicionar testes unitários para funções críticas
 *    - Testes de integração para consumo de API
 * 
 * 3. VALIDAÇÃO:
 *    - Validação mais robusta de dados da API
 *    - Schema validation para garantir estrutura correta
 * 
 * 4. PERFORMANCE:
 *    - Lazy loading de imagens (já implementado parcialmente)
 *    - Debounce em funções de pesquisa
 *    - Cache de requisições API
 * 
 * 5. TIPAGEM:
 *    - Usar TypeScript para type safety
 *    - JSDoc mais completo com tipos
 * 
 * 6. PADRÕES DE DESIGN:
 *    - Implementar padrões como Observer para eventos
 *    - Factory pattern para criação de elementos DOM
 * 
 * 7. REFATORAÇÃO:
 *    - Algumas funções ainda são muito longas (ex: abrirModalMobile)
 *    - Extrair lógica complexa em funções menores
 * 
 * CONCLUSÃO:
 * Este código aplica muitos princípios de Clean Code, mas ainda há espaço para
 * melhorias, especialmente em modularização e testes. A estrutura atual é
 * legível e mantível, mas pode ser ainda melhor com mais refatoração.
 */