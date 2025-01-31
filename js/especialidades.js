// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");


// Variáveis globais
let items = [];
let infoBasicasUsuarioJson = {};

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de inicialização
document.addEventListener("DOMContentLoaded", async () => {
    await getEspecialidades();
    await getInfoBasicasUsuario();
    mostrarProfissionais();
    loadingScreen.style.display = "none";
});


//Função para buscar especialidades
async function getEspecialidades() {
    try {
        const response = await fetch(`${apiPrefix}Especialidade/GetDetalhesEspecialidades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        items = await response.json();
    } catch (error) {
        console.error(error)
        alert("Servidor não está respondendo. Tente novamente mais tarde!")
        window.location.href = "SP-Medical-Group-Front-End/"
    }
}

//Função para mostrar especialidades
function mostrarProfissionais() {
    const especialidades = document.getElementById("section-id");
    items.forEach(esp => {        
        especialidades.innerHTML += 
        `<div class="div-card" data-nome-especialidade="${esp.especialidade}" onclick="window.location.href = './profissionais.html?especialidade=${esp.especialidade}'">
            <h3 class="nome-especialidade">${esp.especialidade}</h3>
            <p class="descricao-especialidade">${esp.descricao}</p>
            <div class="additional-information">
                <p>${esp.numeroMedicos} médico(s) disponível(is)</p>
                <p>A partir de R$${esp.precoMinimo.toFixed(2)}</p>
            </div>
        </div>`;
    });
}

// Função para carregar o header de acordo com o status do usuário: logado ou não logado
function loadHeaderLogged () {
    const header = document.getElementById("header");

    header.innerHTML =  `
        <a href="./portal-do-paciente/paciente.html"><img id="logo-img" src="../assets/spmg-branco.png" alt=""/></a>
        <div id="div-options-header">
          <a href="./portal-do-paciente/minhas-consultas.html">Minhas consultas</a>
          <a href="./portal-do-paciente/agenda.html">Agenda</a>
          <a href="./portal-do-paciente/meu-perfil.html">Meu perfil</a>
        </div>
        <div id="profile-container">
          <div id="div-foto-perfil-options"><img src="" id="foto-perfil-options" alt="Foto do Perfil" /></div>
          <div id="profile-menu">
            <ul>
              <li id="view-profile">Ver Perfil</li>
              <li id="logout">Logout</li>
            </ul>
          </div>
        </div>`
    carregarFotoPerfilOptions();
}

function loadHeaderNotLogged() {
    const header = document.getElementById("header");

    header.innerHTML = `
        <a href="/index.html"><img id="logo-img" src="../../assets/spmg-branco.png" alt=""/></a>
        <div id="div-options-header">
          <a href="">Sobre nós</a>
          <a href="">Empresas afiliadas</a>
          <a href="">Contato</a>
        </div>
      <a href="/SP-Medical-Group-Front-End/html/login.html" id="entrar-btn"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.00098 11.999L16.001 11.999M16.001 11.999L12.501 8.99902M16.001 11.999L12.501 14.999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827" stroke="white" stroke-width="1.5" stroke-linecap="round"></path> </g></svg></a>
    `
}

async function getInfoBasicasUsuario() {
    try {
        const InfoBasicasUsuario = await fetch(`${apiPrefix}Paciente/GetInfoBasicasUsuarioPaciente?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (InfoBasicasUsuario.status == 200) {
            infoBasicasUsuarioJson = await InfoBasicasUsuario.json();
            loadHeaderLogged();
            return;
        }
        
        loadHeaderNotLogged();
    } catch (error) {
        console.error("Erro ao buscar informações básicas do usuário:", error);
    }
}

function carregarFotoPerfilOptions() {
    const profileContainer = document.getElementById("profile-container");
    const profileMenu = document.getElementById("profile-menu");
    const logoutOption = document.getElementById("logout");
    const viewProfileOption = document.getElementById("view-profile");
    const fotoPerfilOptions = document.getElementById("foto-perfil-options");

    fotoPerfilOptions.src = infoBasicasUsuarioJson.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : infoBasicasUsuarioJson.fotoPerfilUrl;


    fotoPerfilOptions.addEventListener("click", () => {
        profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!profileContainer.contains(event.target)) {
            profileMenu.style.display = "none";
        }
    });

    logoutOption.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "SP-Medical-Group-Front-End/";
    });

    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });
}