// Selecionando os elementos
const btnAbrirModal = document.getElementById('btn-trans');
const modal = document.getElementById('modal-container');
const btnSalvar = document.getElementById('salvar-btn');
const tabelaBody = document.querySelector('table tbody');

// Função para abrir o modal
btnAbrirModal.onclick = () => {
    modal.style.display = 'flex';
};

//LocalStorage
// 1. Variável principal que armazenará nossos dados
let listaTransacoes = JSON.parse(localStorage.getItem('minhas_transacoes')) || [];

// 2. Função para salvar no LocalStorage
function salvarNoStorage() {
    localStorage.setItem('minhas_transacoes', JSON.stringify(listaTransacoes));
}

// 3. Modificando o seu botão Salvar
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

    /* Testes btnm delete*/
    // Atualiza os cards
    // Recarrega os ícones do Lucide para as novas lixeiras aparecerem
    lucide.createIcons();

    // 3. O Pulo do Gato: Atualizando os elementos da tela
    // Certifique-se de que os nomes das classes ou IDs batem com seu HTML
    document.querySelector('.card-in .value').innerText = `R$ ${totalEntradas.toFixed(2)}`;
    document.querySelector('.card-out .value').innerText = `R$ ${totalSaidas.toFixed(2)}`;
    
    const saldoFinal = totalEntradas - totalSaidas;
    document.querySelector('.card .value').innerText = `R$ ${saldoFinal.toFixed(2)}`;
}

// --- FUNÇÃO PARA DELETAR ---
function deletarTransacao(id) {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
        // Filtra a lista removendo o item com o ID correspondente
        listaTransacoes = listaTransacoes.filter(t => t.id !== id);
        
        salvarNoStorage(); // Salva a nova lista no LocalStorage
        renderizarTudo();  // Reatualiza a tela
    }
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

/*inputArquivo.onchange = (event) => {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
        try {
            const dadosImportados = JSON.parse(e.target.result);

            if (Array.isArray(dadosImportados)) {
                if (confirm("Isso irá substituir seus dados atuais. Deseja continuar?")) {
                    listaTransacoes = dadosImportados;
                    salvarNoStorage();
                    renderizarTudo();
                    alert("Dados importados com sucesso!");
                }
            } else {
                alert("Arquivo inválido.");
            }
        } catch (erro) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    leitor.readAsText(arquivo);
};*/

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
