const btnAbrirModal = document.getElementById('btn-trans');
const modal = document.getElementById('modal-container');
const btnSalvar = document.getElementById('salvar-btn');
const tabelaBody = document.querySelector('table tbody');

// Função para abrir o modal
btnAbrirModal.onclick = () => {
    modal.style.display = 'flex';
};

// 1. Variável principal que armazenará nossos dados
let listaTransacoes = JSON.parse(localStorage.getItem('minhas_transacoes')) || [];

function salvarNoStorage() {
    localStorage.setItem('minhas_transacoes', JSON.stringify(listaTransacoes));
}

//Modificando o seu botão Salvar
btnSalvar.onclick = () => {
    const nome = document.getElementById('desc-trans').value;
    const categoria = document.getElementById('categoria-trans').value;
    const valorNum = parseFloat(document.getElementById('valor-trans').value);
    const tipo = document.getElementById('tipo-trans').value;

    if (!nome || isNaN(valorNum)) {
        alert("Preencha os campos corretamente!");
        return;
    }

    // Criamos um objeto para a transação
    const novaTransacao = {
        id: Date.now(), // ID único para cada uma
        nome,
        categoria,
        valor: valorNum,
        tipo,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Adicionamos na nossa lista e salvamos
    listaTransacoes.push(novaTransacao);
    salvarNoStorage();
    
    // Atualizamos a interface
    renderizarTudo();

    modal.style.display = 'none';
    limparCampos();
};


// 4. Função que desenha tudo na tela ao carregar ou atualizar
function renderizarTudo() {
    tabelaBody.innerHTML = ''; // Limpa a tabela para não duplicar
    
    let totalEntradas = 0;
    let totalSaidas = 0;

    listaTransacoes.forEach(transacao => {
        // Lógica de soma para os cards
        if (transacao.tipo === 'entrada') {
            totalEntradas += transacao.valor;
        } else {
            totalSaidas += transacao.valor;
        }

        // Adiciona a linha na tabela
        const novaLinha = document.createElement('tr');
        const classeCor = transacao.tipo === 'entrada' ? 'text-green' : 'text-red';

        novaLinha.innerHTML = `
            <td>${transacao.nome}</td>
            <td>${transacao.categoria}</td>
            <td>${transacao.data}</td>
            <td class="${classeCor}">${transacao.tipo === 'saida' ? '-' : ''} R$ ${transacao.valor.toFixed(2)}</td>
        `;
        tabelaBody.appendChild(novaLinha);
    });

    // Atualiza os cards
    atualizarCards(totalEntradas, totalSaidas);
    
    // Recarrega os ícones do Lucide para as novas lixeiras aparecerem
    lucide.createIcons();

    // Atualiza os Cards de Resumo
    displayEntradas.innerText = `R$ ${totalEntradas.toFixed(2)}`;
    displaySaidas.innerText = `R$ ${totalSaidas.toFixed(2)}`;
    displaySaldo.innerText = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`;
}

// 5. Chamada inicial ao abrir a página
renderizarTudo();


function renderizarTudo() {
    tabelaBody.innerHTML = ''; 
    
    // Iniciamos os contadores do zero para recalcular
    let totalEntradas = 0;
    let totalSaidas = 0;

    listaTransacoes.forEach(transacao => {
        // 1. Lógica Matemática para os Cards
        if (transacao.tipo === 'entrada') {
            totalEntradas += transacao.valor;
        } else {
            totalSaidas += transacao.valor;
        }

        // 2. Criação da linha na tabela (como já estávamos fazendo)
        const novaLinha = document.createElement('tr');
        const classeCor = transacao.tipo === 'entrada' ? 'text-green' : 'text-red';

        novaLinha.innerHTML = `
            <td>${transacao.nome}</td>
            <td>${transacao.categoria}</td>
            <td>${transacao.data}</td>
            <td class="${classeCor}">${transacao.tipo === 'saida' ? '-' : ''} R$ ${transacao.valor.toFixed(2)}</td>
            <td>
                <button class="btn-delete" onclick="deletarTransacao(${transacao.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
            `;
            
        tabelaBody.appendChild(novaLinha);
    });

    lucide.createIcons();

    document.querySelector('.card-in .value').innerText = `R$ ${totalEntradas.toFixed(2)}`;
    document.querySelector('.card-out .value').innerText = `R$ ${totalSaidas.toFixed(2)}`;
    
    const saldoFinal = totalEntradas - totalSaidas;
    document.querySelector('.card .value').innerText = `R$ ${saldoFinal.toFixed(2)}`;
}

// --- FUNÇÃO PARA DELETAR (ESTILIZADA) ---
function deletarTransacao(id) {
    Swal.fire({
        title: 'Excluir transação?',
        text: "Você tem certeza que deseja remover este item?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c', // Verde (ou use a cor do seu dashboard)
        cancelButtonColor: '#4361EE',  // Vermelho',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        // Opcional: Estilo Dark para combinar com dashboards
        background: '#1e1e1e',
        color: '#ffffff'
    }).then((result) => {
        // Se o usuário clicou em "Sim"
        if (result.isConfirmed) {
            
            // 1. Filtra a lista (Sua lógica original)
            listaTransacoes = listaTransacoes.filter(t => t.id !== id);

            // 2. Salva e Renderiza
            salvarNoStorage(); 
            renderizarTudo();

            // 3. Feedback visual de que deu certo
            Swal.fire({
                title: 'Deletado!',
                text: 'A transação foi removida.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1e1e1e',
                color: '#ffffff'
            });
        }
    });
}

// Salvar e carregar dados
const btnExportar = document.getElementById('btn-exportar');
const btnImportar = document.getElementById('btn-importar');
const inputArquivo = document.getElementById('importar-arquivo');

// --- FUNÇÃO EXPORTAR (Download do JSON) ---
btnExportar.onclick = () => {
    if (listaTransacoes.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    const dadosStr = JSON.stringify(listaTransacoes, null, 2);
    const blob = new Blob([dadosStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup_financas.json';
    link.click();

    URL.revokeObjectURL(url); // Limpa a memória
};

// --- FUNÇÃO IMPORTAR (Leitura do JSON) ---
btnImportar.onclick = () => {
    inputArquivo.click(); // Abre a janelinha de escolher arquivo
};

const loading = document.getElementById('loading-overlay');

inputArquivo.onchange = (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    // Mostra o loading
    loading.style.display = 'flex';

    const leitor = new FileReader();
    
    leitor.onload = (e) => {
        // Simulamos um atraso de 1.5 segundos para o loading ficar visível
        setTimeout(() => {
            try {
                const dadosImportados = JSON.parse(e.target.result);
                if (Array.isArray(dadosImportados)) {
                    listaTransacoes = dadosImportados;
                    salvarNoStorage();
                    renderizarTudo();
                    alert("Dados importados com sucesso!");
                }
            } catch (erro) {
                alert("Erro ao ler o arquivo.");
            } finally {
                // Esconde o loading independente de dar erro ou sucesso
                loading.style.display = 'none';
            }
        }, 1500);
    };
    
    leitor.readAsText(arquivo);
};
