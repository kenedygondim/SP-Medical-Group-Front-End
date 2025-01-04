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

// Evento de inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await getDadosBasicosUsuario();
    createProfilePictureActions();
    loadingScreen.style.display = "none";
});

// Função que busca as informações básicas do usuário (URL da foto de perfil, email, nome, CPF)
async function getDadosBasicosUsuario() {
    const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Medico/InfoBasicasUsuario?email=${email}`, {
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
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Evento de submissão do formulário de disponibilidade
availabilityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const body = {
        emailMedico: sessionStorage.getItem('email'),
        dataDisp: date,
        horaInicio: startTime,
        horaFim: endTime
    };

    postDisponibilidade(body);
});

// Função que envia uma requisição POST para cadastrar uma disponibilidade
async function postDisponibilidade(body) {
    try {
        const response = await fetch('http://localhost:8080/api/Disponibilidade/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        if (response.ok) 
            alert('Disponibilidade cadastrada com sucesso!');

    } catch (error) {
        console.error(error);
        alert('Erro ao cadastrar disponibilidade');
    }
}
