// Referência a elementos do HTML
const loadingScreen = document.getElementById("loading-screen");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const fotoPerfilOptions = document.getElementById("foto-perfil-options")

// Recuperação de dados de sessão
const email = sessionStorage.getItem("email");
const token = sessionStorage.getItem("token");

// Variáveis globais
let InfoBasicasUsuarioJson = {};

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    createProfilePictureActions();
    loadingScreen.style.display = "none";
});

async function fetchItems() {
    await getInfoBasicasUsuario();
}

// Função que busca informações básicas do usuário logado no sistema como Foto de perfil, nome completo e CPF
async function getInfoBasicasUsuario() {
    const InfoBasicasUsuario = await fetch(`${apiPrefix}Paciente/InfoBasicasUsuario?email=${email}`, {
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