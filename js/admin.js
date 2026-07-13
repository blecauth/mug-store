// Admin JS
const SENHA_ADMIN = 'admin123';

let produtosAdmin = [];

// Elementos
const loginArea = document.getElementById('loginArea');
const dashboardArea = document.getElementById('dashboardArea');
const senhaInput = document.getElementById('senhaAdmin');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const tableBody = document.getElementById('adminTableBody');
const editModal = document.getElementById('productEditModal');
const editModalClose = document.getElementById('editModalClose');
const editForm = document.getElementById('editProductForm');
const addBtn = document.getElementById('addProductBtn');
const refreshBtn = document.getElementById('refreshBtn');

// Carregar produtos
function carregarProdutosAdmin() {
  // Tentar carregar do localStorage ou do JSON
  const local = localStorage.getItem('produtosFA');
  if (local) {
    try {
      produtosAdmin = JSON.parse(local);
    } catch {
      produtosAdmin = [];
    }
  } else {
    // Carregar do JSON mock
    produtosAdmin = mockProdutos();
    localStorage.setItem('produtosFA', JSON.stringify(produtosAdmin));
  }
  atualizarDashboard();
  renderizarTabela();
}

// Salvar produtos
function salvarProdutos() {
  localStorage.setItem('produtosFA', JSON.stringify(produtosAdmin));
  // Atualizar também o JSON em memória (seria necessário backend para persistir)
}

// Mock igual ao do script principal
function mockProdutos() {
  return [
    { id: 1, nome: 'Caneca "Café & Poesia"', descricao: 'Caneca de porcelana', categoria: 'canecas', preco: 49.90, precoPromocional: 39.90, estoque: 15, badge: 'promocao', ativo: true },
    { id: 2, nome: 'Caneca Mágica', descricao: 'Caneca termocrômica', categoria: 'canecas-magicas', preco: 69.90, precoPromocional: 59.90, estoque: 8, badge: 'novo', ativo: true },
    { id: 3, nome: 'Long Drink Personalizado', descricao: 'Copo longo', categoria: 'long-drink', preco: 59.90, precoPromocional: 49.90, estoque: 12, badge: 'mais-vendido', ativo: true },
    { id: 4, nome: 'Squeeze 500ml', descricao: 'Garrafa squeeze', categoria: 'squeezes', preco: 45.90, precoPromocional: 39.90, estoque: 20, badge: 'promocao', ativo: true }
  ];
}

// Atualizar dashboard
function atualizarDashboard() {
  const ativos = produtosAdmin.filter(p => p.ativo !== false);
  const promocoes = ativos.filter(p => p.badge === 'promocao');
  const semEstoque = ativos.filter(p => p.estoque <= 0);
  const categorias = new Set(ativos.map(p => p.categoria));
  
  document.getElementById('totalProdutos').textContent = ativos.length;
  document.getElementById('totalPromocoes').textContent = promocoes.length;
  document.getElementById('totalCategorias').textContent = categorias.size;
  document.getElementById('totalSemEstoque').textContent = semEstoque.length;
}

// Renderizar tabela
function renderizarTabela() {
  if (!tableBody) return;
  tableBody.innerHTML = produtosAdmin.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>R$ ${(p.precoPromocional || p.preco).toFixed(2)}</td>
      <td>${p.estoque}</td>
      <td><span class="status-badge ${p.ativo !== false ? 'ativo' : 'inativo'}">${p.ativo !== false ? 'Ativo' : 'Inativo'}</span></td>
      <td class="table-actions">
        <button onclick="editarProduto(${p.id})" title="Editar">✏️</button>
        <button onclick="duplicarProduto(${p.id})" title="Duplicar">📋</button>
        <button onclick="toggleAtivo(${p.id})" title="${p.ativo !== false ? 'Ocultar' : 'Ativar'}">${p.ativo !== false ? '🙈' : '👁️'}</button>
        <button onclick="excluirProduto(${p.id})" class="btn-danger" title="Excluir">🗑️</button>
      </td>
    </tr>
  `).join('');
}

// Funções de gerenciamento
function editarProduto(id) {
  const produto = produtosAdmin.find(p => p.id === id);
  if (!produto) return;
  
  document.getElementById('editId').value = produto.id;
  document.getElementById('editNome').value = produto.nome;
  document.getElementById('editDescricao').value = produto.descricao || '';
  document.getElementById('editCategoria').value = produto.categoria || '';
  document.getElementById('editPreco').value = produto.preco || '';
  document.getElementById('editPrecoPromo').value = produto.precoPromocional || '';
  document.getElementById('editEstoque').value = produto.estoque || 0;
  document.getElementById('editBadge').value = produto.badge || '';
  document.getElementById('editAtivo').checked = produto.ativo !== false;
  
  document.getElementById('editModalTitle').textContent = `✏️ Editar: ${produto.nome}`;
  editModal.classList.add('open');
}

function duplicarProduto(id) {
  const original = produtosAdmin.find(p => p.id === id);
  if (!original) return;
  
  const novo = { ...original, id: Math.max(...produtosAdmin.map(p => p.id)) + 1, nome: original.nome + ' (cópia)' };
  produtosAdmin.push(novo);
  salvarProdutos();
  atualizarDashboard();
  renderizarTabela();
  mostrarToast('✅ Produto duplicado com sucesso!');
}

function toggleAtivo(id) {
  const produto = produtosAdmin.find(p => p.id === id);
  if (!produto) return;
  produto.ativo = produto.ativo === false ? true : false;
  salvarProdutos();
  atualizarDashboard();
  renderizarTabela();
  mostrarToast(`✅ Produto ${produto.ativo !== false ? 'ativado' : 'ocultado'}!`);
}

function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  produtosAdmin = produtosAdmin.filter(p => p.id !== id);
  salvarProdutos();
  atualizarDashboard();
  renderizarTabela();
  mostrarToast('✅ Produto excluído!');
}

// Salvar edição
editForm?.addEventListener('submit', function(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('editId').value);
  const produto = produtosAdmin.find(p => p.id === id);
  if (!produto) return;
  
  produto.nome = document.getElementById('editNome').value;
  produto.descricao = document.getElementById('editDescricao').value;
  produto.categoria = document.getElementById('editCategoria').value;
  produto.preco = parseFloat(document.getElementById('editPreco').value) || 0;
  produto.precoPromocional = parseFloat(document.getElementById('editPrecoPromo').value) || null;
  produto.estoque = parseInt(document.getElementById('editEstoque').value) || 0;
  produto.badge = document.getElementById('editBadge').value || '';
  produto.ativo = document.getElementById('editAtivo').checked;
  
  salvarProdutos();
  atualizarDashboard();
  renderizarTabela();
  editModal.classList.remove('open');
  mostrarToast('✅ Produto atualizado!');
});

// Adicionar novo
addBtn?.addEventListener('click', function() {
  const novoId = Math.max(...produtosAdmin.map(p => p.id)) + 1;
  const novo = {
    id: novoId,
    nome: 'Novo Produto',
    descricao: 'Descrição do produto',
    categoria: 'outros',
    preco: 0,
    precoPromocional: null,
    estoque: 0,
    badge: '',
    ativo: true
  };
  produtosAdmin.push(novo);
  salvarProdutos();
  atualizarDashboard();
  renderizarTabela();
  editarProduto(novoId);
});

// Login
loginBtn?.addEventListener('click', function() {
  if (senhaInput.value === SENHA_ADMIN) {
    loginArea.style.display = 'none';
    dashboardArea.style.display = 'block';
    carregarProdutosAdmin();
    mostrarToast('✅ Bem-vindo, administrador!');
  } else {
    alert('Senha incorreta!');
  }
});

senhaInput?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn?.addEventListener('click', function() {
  loginArea.style.display = 'flex';
  dashboardArea.style.display = 'none';
  senhaInput.value = '';
  mostrarToast('👋 Até logo!');
});

// Fechar modal de edição
editModalClose?.addEventListener('click', () => editModal.classList.remove('open'));
editModal?.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.classList.remove('open');
});

// Refresh
refreshBtn?.addEventListener('click', function() {
  carregarProdutosAdmin();
  mostrarToast('🔄 Dados atualizados!');
});

// Toast simplificado
function mostrarToast(msg) {
  const toast = document.getElementById('toast') || criarToast();
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function criarToast() {
  const t = document.createElement('div');
  t.id = 'toast';
  t.className = 'toast';
  document.body.appendChild(t);
  return t;
}

// Inicializar (se já logado)
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se já está logado (para demo, mantém)
  if (localStorage.getItem('adminLogado') === 'true') {
    loginArea.style.display = 'none';
    dashboardArea.style.display = 'block';
    carregarProdutosAdmin();
  }
  
  // Salvar login
  const originalLogin = loginBtn.click;
  loginBtn.addEventListener('click', function() {
    if (senhaInput.value === SENHA_ADMIN) {
      localStorage.setItem('adminLogado', 'true');
    }
  });
});
