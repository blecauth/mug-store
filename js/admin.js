let produtos = [];
let proximoId = 1;

// Tenta carregar o JSON existente ao abrir
async function carregarInicial() {
  try {
    const resp = await fetch('data/produtos.json');
    if (resp.ok) {
      const data = await resp.json();
      produtos = data.produtos || [];
      atualizarProximoId();
      renderizarTabela();
    }
  } catch (e) {
    console.log('Nenhum produtos.json encontrado ainda. Comece adicionando produtos.');
  }
}

function atualizarProximoId() {
  proximoId = produtos.length > 0
    ? Math.max(...produtos.map(p => p.id)) + 1
    : 1;
}

// Submissão do formulário
document.getElementById('formProduto').addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('produtoId').value;
  const produto = {
    id: id ? parseInt(id) : proximoId++,
    nome: document.getElementById('nome').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    preco: parseFloat(document.getElementById('preco').value),
    imagem: document.getElementById('imagem').value.trim(),
    categoria: document.getElementById('categoria').value,
    estoque: parseInt(document.getElementById('estoque').value),
    destaque: document.getElementById('destaque').checked
  };

  if (id) {
    const idx = produtos.findIndex(p => p.id === parseInt(id));
    produtos[idx] = produto;
  } else {
    produtos.push(produto);
  }

  limparFormulario();
  renderizarTabela();
  alert('Produto salvo! Não esqueça de exportar o JSON.');
});

function limparFormulario() {
  document.getElementById('formProduto').reset();
  document.getElementById('produtoId').value = '';
}

document.getElementById('btnLimpar').addEventListener('click', limparFormulario);

// Renderiza a tabela
function renderizarTabela() {
  const tbody = document.getElementById('tbodyProdutos');
  if (produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhum produto cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = produtos.map(p => `
    <tr>
      <td><img src="${p.imagem}" alt="${p.nome}"></td>
      <td>${p.nome}</td>
      <td>${p.categoria}</td>
      <td>R$ ${p.preco.toFixed(2).replace('.', ',')}</td>
      <td>${p.estoque}</td>
      <td>${p.destaque ? '<span class="badge-sim">Sim</span>' : '<span class="badge-nao">Não</span>'}</td>
      <td>
        <button class="acoes-btn btn-editar" onclick="editarProduto(${p.id})">Editar</button>
        <button class="acoes-btn btn-excluir" onclick="excluirProduto(${p.id})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function editarProduto(id) {
  const p = produtos.find(x => x.id === id);
  document.getElementById('produtoId').value = p.id;
  document.getElementById('nome').value = p.nome;
  document.getElementById('descricao').value = p.descricao;
  document.getElementById('preco').value = p.preco;
  document.getElementById('estoque').value = p.estoque;
  document.getElementById('imagem').value = p.imagem;
  document.getElementById('categoria').value = p.categoria;
  document.getElementById('destaque').checked = p.destaque;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function excluirProduto(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    produtos = produtos.filter(p => p.id !== id);
    renderizarTabela();
  }
}

// Exportar JSON
document.getElementById('btnExportar').addEventListener('click', () => {
  const dados = JSON.stringify({ produtos }, null, 2);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'produtos.json';
  link.click();
  URL.revokeObjectURL(url);
});

// Importar JSON
document.getElementById('fileImport').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      produtos = data.produtos || [];
      atualizarProximoId();
      renderizarTabela();
      alert(`${produtos.length} produtos carregados com sucesso!`);
    } catch (err) {
      alert('Arquivo inválido. Verifique se é um produtos.json válido.');
    }
  };
  reader.readAsText(file);
});

carregarInicial();
