// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");
const form = document.getElementById("section-filtros");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const fotoPerfilOptions = document.getElementById("foto-perfil-options")
const numeroPacientes = document.getElementById("pacientes-encontrados-ou-nao");
const perfis = document.getElementById("pacientes-encontrados");
const select = document.getElementById('especialidade-select');

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

//Declaração de variáveis globais
const params = new URLSearchParams(window.location.search);
const especialidade = params.get('especialidade');
const nomeDoPaciente = params.get('paciente');
const dataAtendimento = params.get('dataAtendimento');
let InfoBasicasUsuarioJson = {};
let informacoesBasicasPacienteJson = [];
let especialidadesMedicoJson = [];

// Evento de inicialização
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    createProfilePictureActions();
    carregarEspecialidadeMedicoSelect();
    mostrarPacientes();
    loadingScreen.style.display = "none";
} );

// Função para buscar dados da API
async function fetchItems() {
    await getInfoBasicasUsuario();
    await getInformacoesBasicasPacientes();
    await getEspecialidadesMedico();
}

// Função que busca informações básicas do usuário logado no sistema como Foto de perfil, nome completo e CPF
async function getInfoBasicasUsuario() {
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

// Função que busca informações básicas dos pacientes com base nos parâmetros buscados para exibição 
async function getInformacoesBasicasPacientes() {
    try {
        const url = "http://localhost:8080/api/Paciente/InformacoesBasicasPaciente";
        const informacoesBasicasPaciente = await fetch(
            `${url}?emailMedico=${email}&${especialidade == null ? "" : `especialidade=${especialidade}&`}${nomeDoPaciente == null ? "" : `nomePaciente=${nomeDoPaciente}&`}${dataAtendimento == null ? "" : `dataAtendimento=${dataAtendimento}&`}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        informacoesBasicasPacienteJson = await informacoesBasicasPaciente.json();
    } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
    }
}

// Função que busca as especialidades que o médico logado atende
async function getEspecialidadesMedico() {
    try {
        const especialidades = await fetch(`http://localhost:8080/api/Especialidade/obterEspecialidadesMedico?cpf=${InfoBasicasUsuarioJson.cpf}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        especialidadesMedicoJson = await especialidades.json();
    }
    catch (error) {
        console.error("Erro ao buscar especialidades do médico:", error);
    }
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Função que mostra na tela o resultado dos pacientes
function mostrarPacientes() {
    const pacientesUnicos = [...new Set(informacoesBasicasPacienteJson.map(paciente => paciente.cpf))].map(cpf => informacoesBasicasPacienteJson.find(paciente => paciente.cpf === cpf));
    if (especialidade !== null) 
        pacientesUnicos.length === 0 ? numeroPacientes.textContent = `Nenhum paciente encontrado` : numeroPacientes.textContent = `Encontramos ${pacientesUnicos.length} paciente(s) de ${especialidade.toLowerCase()}.`;
    else 
        pacientesUnicos.length === 0 ? numeroPacientes.textContent = `Nenhum paciente encontrado` : numeroPacientes.textContent = `Encontramos ${pacientesUnicos.length} paciente(s).`;
    
    construirElementoPacientes(pacientesUnicos);
}

// Função que constroi a div do perfil do paciente
function construirElementoPacientes(pacientesUnicos) {
    pacientesUnicos.forEach(profissional => {
        // Criando elementos
        const left = document.createElement("div");
        const right = document.createElement("div");
        const perfil = document.createElement("div");
        const foto = document.createElement("img");
        const nomeUsuario = document.createElement("h3");
        const agrupaParagrafo = document.createElement("div");

        // Adicionando classes
        left.className = "left";
        right.className = "right";
        perfil.className = "perfil";
        foto.className = "foto";
        agrupaParagrafo.className = "agrupa-paragrafo";

        // Adicionando conteúdo
        foto.src = profissional.fotoPerfilUrl;
        nomeUsuario.textContent = profissional.nomeCompleto;

        // Adicionando atributos
        perfil.setAttribute('paciente-identificador', profissional.cpf);

        // Adicionando elementos ao HTML
        perfil.appendChild(left);
        perfil.appendChild(right);
        left.appendChild(foto);
        right.appendChild(nomeUsuario);
        right.appendChild(agrupaParagrafo);

        perfis.appendChild(perfil);
    });
}

// Função que carega as options do select com as especialidades do médico
function carregarEspecialidadeMedicoSelect() {
    especialidadesMedicoJson.forEach(especialidade => {
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

    if (nomeDoPaciente) {
        const inputa = document.getElementById('nome-paciente-input');
        inputa.value = nomeDoPaciente;
    }

    if (dataAtendimento) {
        const inputg = document.getElementById('data-atendimento-input');
        inputg.value = dataAtendimento;
    }
}

// Função de submissão e recarregamento da pagina com os novos resultados
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const especialidade = document.getElementById('especialidade-select').value;
    const paciente = document.getElementById('nome-paciente-input').value;
    const dataAtendimento = document.getElementById('data-atendimento-input').value;

    const params = {
        ...( especialidade != "0" && { especialidade }),
        ...( paciente && { paciente }),
        ...( dataAtendimento && { dataAtendimento })
    }

    const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

     window.location.href = `pacientes.html?${queryString}`
});

