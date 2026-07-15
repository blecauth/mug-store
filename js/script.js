let produtos = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Carrega produtos do JSON
async function carregarProdutos() {
  try {
    const resp = await fetch('data/produtos.json');
    const data = await resp.json();
    produtos = data.produtos;
    renderizarDestaques();
    renderizarProdutos('todos');
  } catch (e) {
    console.error('Erro ao carregar produtos:', e);
    document.getElementById('gridProdutos').innerHTML =
      '<p>Erro ao carregar produtos. Verifique o arquivo produtos.json.</p>';
  }
}

function renderizarDestaques() {
  const destaques = produtos.filter(p => p.destaque);
  document.getElementById('gridDestaques').innerHTML =
    destaques.map(criarCard).join('');
}

function renderizarProdutos(categoria) {
  const filtrados = categoria === 'todos'
    ? produtos
    : produtos.filter(p => p.categoria === categoria);
  document.getElementById('gridProdutos').innerHTML =
    filtrados.map(criarCard).join('') || '<p>Nenhum produto encontrado.</p>';
}

function criarCard(p) {
  const semEstoque = p.estoque <= 0;
  return `
    <div class="card-produto">
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="card-info">
        <h4>${p.nome}</h4>
        <p>${p.descricao}</p>
        <div class="card-preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        <button class="btn-comprar" onclick="adicionarCarrinho(${p.id})" ${semEstoque ? 'disabled' : ''}>
          ${semEstoque ? 'Esgotado' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  `;
}

// Filtros
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    renderizarProdutos(btn.dataset.categoria);
  });
});

// Carrinho
function adicionarCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    existente.qtd++;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }
  salvarCarrinho();
  renderizarCarrinho();
}

function removerCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho();
  renderizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function renderizarCarrinho() {
  const container = document.getElementById('carrinhoItens');
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);

  if (carrinho.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#666;">Carrinho vazio</p>';
  } else {
    container.innerHTML = carrinho.map(item => `
      <div class="item-carrinho">
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="item-info">
          <h5>${item.nome}</h5>
          <small>Qtd: ${item.qtd} × R$ ${item.preco.toFixed(2).replace('.', ',')}</small>
        </div>
        <button class="item-remover" onclick="removerCarrinho(${item.id})">×</button>
      </div>
    `).join('');
  }

  document.getElementById('totalCarrinho').textContent = total.toFixed(2).replace('.', ',');
  document.getElementById('contadorCarrinho').textContent = carrinho.reduce((s, i) => s + i.qtd, 0);
}

document.getElementById('btnCarrinho').addEventListener('click', () => {
  document.getElementById('carrinho').classList.add('aberto');
});
document.getElementById('fecharCarrinho').addEventListener('click', () => {
  document.getElementById('carrinho').classList.remove('aberto');
});

// Inicialização
carregarProdutos();
renderizarCarrinho();
