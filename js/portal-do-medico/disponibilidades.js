// Referência a elementos HTML
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const loadingScreen = document.getElementById("loading-screen");
const fotoPerfilOptions = document.getElementById("foto-perfil-options");
const availabilityForm = document.getElementById('availabilityForm');

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

// Declaração de variáveis globais
let InfoBasicasUsuarioJson = {};

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await getDadosBasicosUsuario();
    createProfilePictureActions();
    loadingScreen.style.display = "none";
});

// Função que busca as informações básicas do usuário (URL da foto de perfil, email, nome, CPF)
async function getDadosBasicosUsuario() {
    const InfoBasicasUsuario = await fetch(`${apiPrefix}Medico/InfoBasicasUsuario?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(InfoBasicasUsuario.status !== 200) {
        const errorMessage = await InfoBasicasUsuario.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }
    InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Evento de submissão do formulário de disponibilidade
availabilityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    loadingScreen.style.display = "flex";

    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const body = {
        emailMedico: sessionStorage.getItem('email'),
        dataDisp: date,
        horaInicio: startTime,
        horaFim: endTime
    };

    await postDisponibilidade(body);

    loadingScreen.style.display = "none";
});

// Função que envia uma requisição POST para cadastrar uma disponibilidade
async function postDisponibilidade(body) {
    try {
        const response = await fetch(`${apiPrefix}Disponibilidade/adicionar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        // Processar a resposta do servidor
        const responseJson = await response.json();

        if (response.ok) {
            // Cadastro bem-sucedido
            alert('Disponibilidade cadastrada com sucesso!');
        } else if (response.status === 400) {
            // Erro de validação (exemplo: conflito de horários)
            if (responseJson.detalhes) {
                alert(`Erro: ${responseJson.detalhes}`);
            } else {
                alert(`Erro: ${responseJson.mensagem || 'Ocorreu um erro ao cadastrar a disponibilidade.'}`);
            }
        } else {
            // Outros erros (exemplo: erro no servidor)
            alert(`Erro inesperado: ${responseJson.mensagem || 'Algo deu errado.'}`);
        }
    } catch (error) {
        // Erros de rede ou outras exceções
        console.error('Erro na requisição:', error);
        alert('Falha ao comunicar com o servidor. Por favor, tente novamente mais tarde.');
    }
}

