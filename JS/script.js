const btnAbrirModal = document.getElementById('btn-trans');
const modal = document.getElementById('modal-container');
const btnSalvar = document.getElementById('salvar-btn');
const tabelaBody = document.querySelector('table tbody');

// Criador de formato de moeda brasileira
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

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
    atualizarStatusBackup(true);
    modal.style.display = 'none';
    limparCampos();
};


// 4. Função que desenha tudo na tela ao carregar ou atualizar
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
            <td class="${classeCor}">
                ${transacao.tipo === 'saida' ? '-' : ''} ${formatadorMoeda.format(transacao.valor)}
            </td>
            <td>
                <button class="btn-delete" onclick="deletarTransacao(${transacao.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
            `;
            
        tabelaBody.appendChild(novaLinha);
    });

    lucide.createIcons();
    
    const saldoFinal = totalEntradas - totalSaidas;
 
    document.querySelector('.card-in .value').innerText = formatadorMoeda.format(totalEntradas);
    document.querySelector('.card-out .value').innerText = formatadorMoeda.format(totalSaidas);
    document.querySelector('.card .value').innerText = formatadorMoeda.format(totalEntradas - totalSaidas);
}

// 5. Chamada inicial ao abrir a página
renderizarTudo();

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

            atualizarStatusBackup(true);
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

    atualizarStatusBackup(false);

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
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Seus dados foram carregados com sucesso.',
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false,
                        background: '#1e1e1e',
                        color: '#ffffff'
                    });
                }
            } catch (erro) {
                Swal.fire({
                title: 'Erro!',
                text: 'Não foi possível ler este arquivo. Verifique se é um JSON válido.',
                icon: 'error',
                confirmButtonColor: '#4361EE',
                background: '#1e1e1e',
                color: '#ffffff'
});
            } finally {
                loading.style.display = 'none';
            }
        }, 1500);
    };
    
    leitor.readAsText(arquivo);
};

// 1. Criamos a variável de controle
let alteracoesPendentes = false;

// 2. Função para ativar o alerta visual
function atualizarStatusBackup(pendente) {
   alteracoesPendentes = pendente;
   // Salva o status para o navegador lembrar depois do F5
   localStorage.setItem('status_backup', pendente);

   const btnExportar = document.getElementById('btn-exportar');

    if (alteracoesPendentes) {
        btnExportar.classList.add('atencao-backup');
    } else {
        btnExportar.classList.remove('atencao-backup');
    }   
}

function verificarAlertaAoCarregar() {
    // Busca se existe um alerta pendente salvo
    const statusSalvo = localStorage.getItem('status_backup') === 'true';
    if (statusSalvo) {
        atualizarStatusBackup(true);
    }
}

// Autorization Google email
// Função para decodificar o token do Google (JWT)
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Função que o Google chama após o login
function handleCredentialResponse(response) {
    const data = parseJwt(response.credential);
    
    // data.name é o nome da sua conta Google!
    const nomeGoogle = data.given_name; // Pega apenas o primeiro nome
    
    // Salva no LocalStorage para persistir
    localStorage.setItem('usuario_google', nomeGoogle);
    
    atualizarSaudacaoReal(nomeGoogle);
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "123536121301-m3v9o2c9ntcbrev5ra6nqv1nq1iocost.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    // Renderiza o botão oficial
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }
    );

    // Tenta carregar o nome já salvo
    const nomeSalvo = localStorage.getItem('usuario_google');
    if (nomeSalvo) {
        atualizarSaudacaoReal(nomeSalvo);
    }

    // 🔥 VERIFICAÇÃO DE PERSISTÊNCIA:
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario_logado'));
    
    if (usuarioSalvo && usuarioSalvo.ativo) {
        exibirDadosUsuario(usuarioSalvo.nome, usuarioSalvo.foto);
    }

    // 3. 🔥 O SEGREDO: Verifica se o botão de exportar deve estar laranja
    verificarAlertaAoCarregar();
}

function atualizarSaudacaoReal(nome) {
    const hora = new Date().getHours();
    let cumprimento = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    document.getElementById('saudacao').innerText = `${cumprimento}, ${nome}`;
}

/*window.onload = function () {
  google.accounts.id.initialize({
    client_id: "123536121301-m3v9o2c9ntcbrev5ra6nqv1nq1iocost.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("buttonDiv"), // Crie uma <div id="buttonDiv"> no HTML
    { theme: "outline", size: "large" }
  );
};*/

function handleCredentialResponse(response) {
  // Aqui vamos decodificar o nome do usuário
  const payload = JSON.parse(atob(response.credential.split('.')[1]));
  console.log("Nome do usuário:", payload.name);
  
  // Atualiza a saudação no seu Dashboard
  document.getElementById('saudacao').innerText = `Olá, ${payload.given_name}`;

  // Guardamos os dados no LocalStorage
    localStorage.setItem('usuario_logado', JSON.stringify({
        nome: payload.given_name,
        foto: payload.picture,
        ativo: true
    }));

    exibirDadosUsuario(payload.given_name, payload.picture);
}

function exibirDadosUsuario(nome, foto) {
    const elementoSaudacao = document.getElementById('saudacao');
    const hora = new Date().getHours();
    let cumprimento = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

    if (elementoSaudacao) {
        elementoSaudacao.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${foto}" style="width: 40px; border-radius: 50%;">
                <span>${cumprimento}, ${nome}</span>
            </div>
        `;
    }
    // Esconde o botão do Google após logar
    document.getElementById("buttonDiv").style.display = "none";
}