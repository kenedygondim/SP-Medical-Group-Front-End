// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");

// Recuperação de parâmetros da URL
const params = new URLSearchParams(window.location.search);
const especialidade = params.get('especialidade');
const nomeDoMedico = params.get('medico');
const numCrm = params.get('crm');

// Variáveis globais
let informacoesBasicasMedicoJson = [];
let especialidadesJson = [];
let infoBasicasUsuarioJson = {};

// Infomações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    carregarEspecialidadeMedicoCrm();
    mostrarProfissionais();
    loadingScreen.style.display = "none";
} );

async function fetchItems() {
    await getInfoBasicasUsuario();
    await getInformacoesBasicasMedico();
    await getEspecialidades();
}

async function getInformacoesBasicasMedico() {
    try {
        const url = `${apiPrefix}Medico/GetInfoBasicasMedico`;

        const informacoesBasicasMedico = await fetch(
            `${url}?${especialidade == null ? "" : `especialidade=${especialidade}&`}${nomeDoMedico == null ? "" : `nomeMedico=${nomeDoMedico}&`}${numCrm == null ? "" : `numCrm=${numCrm}&`}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        informacoesBasicasMedicoJson = await informacoesBasicasMedico.json();
    } catch (error) {
        console.error(error)
        alert("Servidor não está respondendo. Tente novamente mais tarde!")
        window.location.href = "../../index.html"
    }
}

async function getEspecialidades () {
    try {
        const especialidades = await fetch(`${apiPrefix}Especialidade/GetAllEspecialidades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        especialidadesJson = await especialidades.json();
    } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
    }
}


// Função para carregar o header de acordo com o status do usuário: logado ou não logado
function loadHeaderLogged () {
    const header = document.getElementById("header");

    header.innerHTML =  `
        <a href="./portal-do-paciente/paciente.html"><img id="logo-img" src="../../assets/spmg-branco.png" alt=""/></a>
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
        <a href="../index.html"><img id="logo-img" src="../../assets/spmg-branco.png" alt=""/></a>
        <div id="div-options-header">
          <a href="">Sobre nós</a>
          <a href="">Empresas afiliadas</a>
          <a href="">Contato</a>
        </div>
      <a href="./login.html" id="entrar-btn"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.00098 11.999L16.001 11.999M16.001 11.999L12.501 8.99902M16.001 11.999L12.501 14.999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827" stroke="white" stroke-width="1.5" stroke-linecap="round"></path> </g></svg></a>
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
        window.location.href = "../../index.html";
    });

    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });
}

function mostrarProfissionais() {
    const numeroProfissionais = document.getElementById("profissionais-encontrados-ou-nao");

    if (especialidade !== null) 
         informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum profissional encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} profissional(is) de ${especialidade.toLowerCase()}.`;
    else 
        informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum profissional encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} profissional(is).`;
    construirElementoMedico();
}

function construirElementoMedico() {
    const perfis = document.getElementById("profissionais-encontrados");

    informacoesBasicasMedicoJson.forEach(profissional => {
        perfis.innerHTML += `
        <div class="perfil" medico-identificador="${profissional.cpf}" onclick="showPopup('${profissional.cpf}')">
            <div class="left">
                <img class="foto" src="${profissional.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : profissional.fotoPerfilUrl}" alt="Foto de ${profissional.nomeCompleto}">
            </div>
            <div class="right">
                <h3>${profissional.nomeCompleto}</h3>
                <div class="agrupa-paragrafo">
                    <p>${profissional.crm}</p>
                    <p>${profissional.nomeFantasia}</p>
                </div>
            </div>
        </div>`;
    });
}

async function getInformacoesMedicoEspecifico(medicoIdentificador) {
    try {
        const medico = await fetch(`${apiPrefix}Medico/GetDetalhesMedico?cpfMedico=${medicoIdentificador}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await medico.json();
    }
    catch (error) {
        console.error("Erro ao buscar informações do médico:", error);
    }
}

async function getEspecialidadesMedico(medicoIdentificador) {
    try {
        const especialidades = await fetch(`${apiPrefix}Especialidade/GetAllEspecialidadesMedico?cpf=${medicoIdentificador}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await especialidades.json();
    }
    catch (error) {
        console.error("Erro ao buscar especialidades do médico:", error);
    }
}

async function showPopup(medicoIdentificador) {
    const medico = await getInformacoesMedicoEspecifico(medicoIdentificador);
    const especialidades = await getEspecialidadesMedico(medicoIdentificador);

    const espec = especialidades.map(especialidade => especialidade.nome).join(", ");

    // Referência a elementos HTML
    const fotoPerfil = document.getElementById("fotoPerfil");
    const nomeMedico = document.getElementById("nomeMedico");
    const dataNascimento = document.getElementById("span-data-nascimento");
    const numeroConsultas = document.getElementById("span-num-consultas");
    const crm = document.getElementById("span-crm");
    const contato = document.getElementById("span-contato");
    const hospital = document.getElementById("span-hospital");
    const especialidadess = document.getElementById("span-especialidades");

    // Preenchendo as informações no pop-up
    fotoPerfil.src = medico.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : medico.fotoPerfilUrl;
    nomeMedico.textContent = medico.nomeCompleto;
    dataNascimento.textContent = `${calcularIdade(medico.dataNascimento)}`;
    numeroConsultas.textContent = `${medico.numeroConsultas}`;
    crm.textContent = `${medico.crm}`;
    contato.textContent = `${medico.email}`;
    hospital.textContent = `${medico.nomeFantasia == "" ? "Hospital não informado" : medico.nomeFantasia}`;
    especialidadess.textContent = `${espec == "" ? "Especialidade(s) não informada(s)" : espec}`;

    // Exibir o pop-up
    popupOverlay.style.display = "flex";
    popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent); 
}


// Evento para fechar o pop-up
document.getElementById('closePopup').addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

// Redirecionar para agendar consulta
document.getElementById('agendarConsulta').addEventListener("click", async () => {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${apiPrefix}Consulta/Acessar`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        } 
    });

    if(response.status != 200) 
        window.location.href = "./login.html"
    
    if (especialidade != null) {
        window.location.href = `./portal-do-paciente/agendar-consulta.html?medico=${popupOverlay.getAttribute('medico-identificador')}&especialidade=${especialidade}`;
    } 
    else {
        window.location.href = `./portal-do-paciente/agendar-consulta.html?medico=${popupOverlay.getAttribute('medico-identificador')}`;
    }   
});


function carregarEspecialidadeMedicoCrm() {
    const select = document.getElementById('especialidade-select');

    especialidadesJson.forEach(especialidade => {
        const option = document.createElement('option');
        option.value = especialidade.nome;
        option.textContent = especialidade.nome;
        select.appendChild(option);
    });

    if (especialidade) {
        const optionToSelect = select.querySelector(`option[value="${especialidade}"]`);
        if (optionToSelect) 
            optionToSelect.selected = true;
    }

    if (nomeDoMedico) {
        const inputa = document.getElementById('nome-medico-input');
        inputa.value = nomeDoMedico;
    }

    if (numCrm) {
        const inputg = document.getElementById('numero-crm-input');
        inputg.value = numCrm;
    }
}

// Evento de clique para filtrar profissionais de acordo com a busca do usuário
document.getElementById("section-filtros").addEventListener("submit", function (event) {
    event.preventDefault();

    const especialidade = document.getElementById('especialidade-select').value;
    const medico = document.getElementById('nome-medico-input').value;
    const crm = document.getElementById('numero-crm-input').value;

    const params = {
        ...( especialidade != "0" && { especialidade }),
        ...( medico && { medico }),
        ...( crm && { crm })
    }

    const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`) // Substitui null/undefined por string vazia
    .join('&')

     window.location.href = `profissionais.html?${queryString}`
});

// Função para retornar idade do usuário com base na data de nascimento. 
// Exemplo de entrada: "2004-07-07"
// Exemplo de saída: "20 anos e 7 meses"
function calcularIdade(dataNascimento) {
    let nascimento = new Date(dataNascimento);
    let hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0) {
        anos--; 
        meses += 12;
    }

    return `${anos} anos e ${meses} ${meses == 1 ? "mês" : "meses"}`;
}