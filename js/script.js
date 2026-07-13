/* ========================================
   FA Sublimações - Script Principal
   ======================================== */

// ---------- DADOS GLOBAIS ----------
let produtos = [];
let carrinho = [];
let produtosFiltrados = [];
let produtoAtual = null;
let currentSlide = 0;

// ---------- ELEMENTOS DOM ----------
const grid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const toast = document.getElementById('toast');
const sortSelect = document.getElementById('sortSelect');
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const indicators = document.getElementById('carouselIndicators');

// ---------- CARREGAR PRODUTOS ----------
async function carregarProdutos() {
  try {
    // Simula carregamento de JSON - em produção usar fetch
    const response = await fetch('data/produtos.json');
    if (!response.ok) throw new Error('Erro ao carregar produtos');
    produtos = await response.json();
    produtosFiltrados = [...produtos];
    renderizarProdutos(produtosFiltrados);
    inicializarCarousel();
  } catch (error) {
    console.warn('Usando dados mockados (JSON não encontrado)');
    // Dados mockados para demonstração
    produtos = mockProdutos();
    produtosFiltrados = [...produtos];
    renderizarProdutos(produtosFiltrados);
    inicializarCarousel();
  }
}

// ---------- DADOS MOCK (para demonstração) ----------
function mockProdutos() {
  return [
    {
      id: 1,
      nome: 'Caneca Personalizada "Café & Poesia"',
      descricao: 'Caneca de porcelana com frase personalizada',
      descricaoLonga: 'Caneca de alta qualidade, ideal para presentear. Frase gravada com tecnologia de sublimação, resistente à lavagem.',
      categoria: 'canecas',
      preco: 49.90,
      precoPromocional: 39.90,
      estoque: 15,
      badge: 'promocao',
      imagens: ['img/produto1.jpg', 'img/produto1b.jpg', 'img/produto1c.jpg'],
      modelos: ['Branca', 'Preta'],
      cores: ['Branco', 'Preto'],
      tempoProducao: '3 dias úteis',
      peso: '0.35kg',
      dimensoes: '12x9x9cm',
      ativo: true,
      destaque: true
    },
    {
      id: 2,
      nome: 'Caneca Mágica - Mudança de Cor',
      descricao: 'Caneca que revela a imagem com líquido quente',
      descricaoLonga: 'Caneca mágica com efeito termocrômico. Ao adicionar líquido quente, a imagem aparece. Perfeita para surpresas.',
      categoria: 'canecas-magicas',
      preco: 69.90,
      precoPromocional: 59.90,
      estoque: 8,
      badge: 'novo',
      imagens: ['img/produto2.jpg', 'img/produto2b.jpg', 'img/produto2c.jpg'],
      modelos: ['Branca', 'Preta', 'Azul'],
      cores: ['Branco', 'Preto', 'Azul'],
      tempoProducao: '5 dias úteis',
      peso: '0.38kg',
      dimensoes: '12x9x9cm',
      ativo: true,
      destaque: true
    },
    {
      id: 3,
      nome: 'Long Drink Personalizado',
      descricao: 'Copo longo para drinks com estampa exclusiva',
      descricaoLonga: 'Copo Long Drink com capacidade de 400ml. Ideal para drinks, sucos e refrigerantes. Estampa personalizada de alta durabilidade.',
      categoria: 'long-drink',
      preco: 59.90,
      precoPromocional: 49.90,
      estoque: 12,
      badge: 'mais-vendido',
      imagens: ['img/produto3.jpg', 'img/produto3b.jpg', 'img/produto3c.jpg'],
      modelos: ['Transparente', 'Fumê'],
      cores: ['Transparente', 'Fumê'],
      tempoProducao: '4 dias úteis',
      peso: '0.42kg',
      dimensoes: '15x8x8cm',
      ativo: true,
      destaque: false
    },
    {
      id: 4,
      nome: 'Squeeze Personalizado 500ml',
      descricao: 'Garrafa squeeze com estampa e alça',
      descricaoLonga: 'Squeeze de polietileno atóxico, livre de BPA. Com alça e bico esportivo. Personalização com alta definição.',
      categoria: 'squeezes',
      preco: 45.90,
      precoPromocional: 39.90,
      estoque: 20,
      badge: 'promocao',
      imagens: ['img/produto4.jpg', 'img/produto4b.jpg', 'img/produto4c.jpg'],
      modelos: ['Azul', 'Verde', 'Rosa'],
      cores: ['Azul', 'Verde', 'Rosa'],
      tempoProducao: '3 dias úteis',
      peso: '0.28kg',
      dimensoes: '18x7x7cm',
      ativo: true,
      destaque: false
    }
  ];
}

// ---------- RENDERIZAR PRODUTOS ----------
function renderizarProdutos(produtosLista) {
  if (!grid) return;
  
  // Mostrar skeleton enquanto carrega
  if (produtosLista.length === 0) {
    grid.innerHTML = `
      <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
      <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
      <div class="skeleton-card"><div class="skeleton-image"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div>
    `;
    return;
  }

  grid.innerHTML = produtosLista.map(produto => `
    <div class="product-card" data-id="${produto.id}" data-categoria="${produto.categoria}" data-badge="${produto.badge || ''}">
      ${produto.badge ? `<span class="product-badge badge-${produto.badge}">${formatarBadge(produto.badge)}</span>` : ''}
      <img src="${produto.imagens?.[0] || 'img/placeholder.jpg'}" alt="${produto.nome}" class="product-image" loading="lazy">
      <div class="product-info">
        <div class="product-category">${produto.categoria}</div>
        <h3 class="product-name">${produto.nome}</h3>
        <div class="product-price">
          ${produto.precoPromocional ? `
            <span class="price-current">R$ ${produto.precoPromocional.toFixed(2)}</span>
            <span class="price-old">R$ ${produto.preco.toFixed(2)}</span>
            <span class="price-discount">${Math.round((1 - produto.precoPromocional/produto.preco)*100)}% OFF</span>
          ` : `
            <span class="price-current">R$ ${produto.preco.toFixed(2)}</span>
          `}
        </div>
        <div class="product-actions">
          <button class="btn-view" onclick="abrirModal(${produto.id})">👁️ Visualizar</button>
          <button class="btn-whatsapp-card" onclick="comprarWhatsApp(${produto.id})">💬 Comprar</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ---------- FORMATAR BADGE ----------
function formatarBadge(badge) {
  const map = {
    'novo': 'Novo',
    'promocao': 'Promoção',
    'mais-vendido': 'Mais Vendido'
  };
  return map[badge] || badge;
}

// ---------- FILTRAR PRODUTOS ----------
function filtrarProdutos() {
  const termo = searchInput.value.toLowerCase().trim();
  const categoriaAtiva = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
  const badgeAtivo = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
  
  let filtrados = produtos.filter(p => p.ativo !== false);
  
  // Filtro por busca
  if (termo) {
    filtrados = filtrados.filter(p => 
      p.nome.toLowerCase().includes(termo) ||
      p.descricao.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo) ||
      p.id.toString().includes(termo)
    );
  }
  
  // Filtro por categoria/badge
  if (categoriaAtiva !== 'all') {
    if (['novo', 'promocao', 'mais-vendido'].includes(categoriaAtiva)) {
      filtrados = filtrados.filter(p => p.badge === categoriaAtiva);
    } else {
      filtrados = filtrados.filter(p => p.categoria === categoriaAtiva);
    }
  }
  
  // Ordenação
  const sortValue = sortSelect.value;
  if (sortValue === 'menor-preco') {
    filtrados.sort((a, b) => (a.precoPromocional || a.preco) - (b.precoPromocional || b.preco));
  } else if (sortValue === 'maior-preco') {
    filtrados.sort((a, b) => (b.precoPromocional || b.preco) - (a.precoPromocional || a.preco));
  }
  
  produtosFiltrados = filtrados;
  renderizarProdutos(filtrados);
}

// ---------- ABRIR MODAL ----------
function abrirModal(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  produtoAtual = produto;
  const precoAtual = produto.precoPromocional || produto.preco;
  const economia = produto.precoPromocional ? (produto.preco - produto.precoPromocional).toFixed(2) : 0;
  const economiaPercent = produto.precoPromocional ? Math.round((1 - produto.precoPromocional/produto.preco)*100) : 0;
  
  modalBody.innerHTML = `
    <div class="modal-gallery">
      ${produto.imagens?.map(img => `<img src="${img}" alt="${produto.nome}" loading="lazy">`).join('') || '<p>Imagens não disponíveis</p>'}
    </div>
    <div class="modal-details">
      <h2 id="modalTitle">${produto.nome}</h2>
      <div class="meta">
        <span>📂 ${produto.categoria}</span>
        <span>🆔 Código: ${produto.id}</span>
        <span>⏱️ ${produto.tempoProducao || '3 dias'}</span>
      </div>
      <p>${produto.descricaoLonga || produto.descricao}</p>
      <div class="price-box">
        <span class="current">R$ ${precoAtual.toFixed(2)}</span>
        ${produto.precoPromocional ? `
          <span class="old">R$ ${produto.preco.toFixed(2)}</span>
          <span class="economy">💰 Economia R$ ${economia} (${economiaPercent}% OFF)</span>
        ` : ''}
      </div>
      <div class="options">
        <div>
          <span class="label">📦 Modelos</span>
          ${produto.modelos?.map(m => `<span class="tag">${m}</span>`).join('') || '<span class="tag">Modelo único</span>'}
        </div>
        <div>
          <span class="label">🎨 Cores</span>
          ${produto.cores?.map(c => `<span class="tag">${c}</span>`).join('') || '<span class="tag">Cor única</span>'}
        </div>
      </div>
      <div style="margin: 12px 0; color: var(--text-secondary); font-size: 0.9rem;">
        📦 Estoque: ${produto.estoque > 0 ? `${produto.estoque} unidades` : '⚠️ Indisponível'}
        ${produto.peso ? ` • ⚖️ ${produto.peso}` : ''}
        ${produto.dimensoes ? ` • 📐 ${produto.dimensoes}` : ''}
      </div>
      <button class="btn-buy-whatsapp" onclick="comprarWhatsApp(${produto.id})">
        💬 Comprar pelo WhatsApp
      </button>
    </div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ---------- FECHAR MODAL ----------
function fecharModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ---------- COMPRAR WHATSAPP ----------
function comprarWhatsApp(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  const preco = produto.precoPromocional || produto.preco;
  const mensagem = `Olá! Gostaria de comprar:\n\n` +
    `🛍️ *${produto.nome}*\n` +
    `🆔 Código: ${produto.id}\n` +
    `📂 Categoria: ${produto.categoria}\n` +
    `💰 Preço: R$ ${preco.toFixed(2)}\n` +
    `📦 Modelo: ${produto.modelos?.[0] || 'Padrão'}\n` +
    `🎨 Cor: ${produto.cores?.[0] || 'Padrão'}\n` +
    `⏱️ Produção: ${produto.tempoProducao || '3 dias'}\n\n` +
    `Por favor, me ajude com o pedido! 🙏`;
  
  const url = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  mostrarToast('✅ Pedido encaminhado para o WhatsApp!');
}

// ---------- MOSTRAR TOAST ----------
function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---------- CARROSSEL ----------
function inicializarCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  
  // Criar indicadores
  indicators.innerHTML = slides.map((_, i) => 
    `<span class="${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
  ).join('');
  
  function irParaSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.carousel-indicators span').forEach((el, i) => {
      el.classList.toggle('active', i === currentSlide);
    });
  }
  
  // Eventos
  carouselPrev?.addEventListener('click', () => irParaSlide(currentSlide - 1));
  carouselNext?.addEventListener('click', () => irParaSlide(currentSlide + 1));
  document.querySelectorAll('.carousel-indicators span').forEach(el => {
    el.addEventListener('click', () => irParaSlide(parseInt(el.dataset.index)));
  });
  
  // Auto-play
  let interval = setInterval(() => irParaSlide(currentSlide + 1), 5000);
  document.querySelector('.banner-carousel')?.addEventListener('mouseenter', () => clearInterval(interval));
  document.querySelector('.banner-carousel')?.addEventListener('mouseleave', () => {
    interval = setInterval(() => irParaSlide(currentSlide + 1), 5000);
  });
}

// ---------- EVENTOS ----------
// Menu mobile
menuToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('open'));
});

// Fechar modal
modalClose?.addEventListener('click', fecharModal);
modal?.addEventListener('click', (e) => {
  if (e.target === modal) fecharModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharModal();
});

// Filtros
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', function() {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    filtrarProdutos();
  });
});

// Busca
searchInput?.addEventListener('input', filtrarProdutos);

// Ordenação
sortSelect?.addEventListener('change', filtrarProdutos);

// ---------- INICIAR ----------
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});

// ---------- EXPORTAR PARA ADMIN ----------
window.abrirModal = abrirModal;
window.comprarWhatsApp = comprarWhatsApp;
window.fecharModal = fecharModal;
window.mostrarToast = mostrarToast;
