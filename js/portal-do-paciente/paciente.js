// Referência a elementos do HTML
const loadingScreen = document.getElementById("loading-screen");
const consultas = document.getElementById("appointments");

// Variáveis globais
let especialidadesJson = [];
let infoBasicasUsuarioJson = {};
let consultasPacienteJson = [];

//Recuperação de dados de sessão
const email = sessionStorage.getItem("email");
const token = sessionStorage.getItem("token");

// Prefixo de chamada de API
const apiPrefix = "https://44.210.248.181:5001/api/";

// Evento de carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    carregarFotoPerfilOptions();
    mostrarConsultas();
    document.getElementById("nome-paciente-h2").textContent = `${saudacao()}, ${infoBasicasUsuarioJson.nomeCompleto}!`;
    loadingScreen.style.display = "none";
});


async function fetchItems() {
    if (!token || !email) {
        alert("Ocorreu um erro ao tentar recuperar as informações de sessão. Por favor, faça login novamente.");
        window.location.href = "SP-Medical-Group-Front-End/";
    }

    await getEspecialidades();
    await getInfoBasicasUsuario();
    await getConsultasPaciente();
}

async function getEspecialidades() {
    try {
        const response = await fetch(`${apiPrefix}Especialidade/GetAllEspecialidades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        especialidadesJson = await response.json();

    } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
    }
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

        if (InfoBasicasUsuario.status !== 200) {
            if (InfoBasicasUsuario.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
                window.location.href = "SP-Medical-Group-Front-End/";
            }
            const errorMessage = await InfoBasicasUsuario.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }


        infoBasicasUsuarioJson = await InfoBasicasUsuario.json();
    } catch (error) {
        console.error("Erro ao buscar informações básicas do usuário:", error);
    }
}

async function getConsultasPaciente() {
    try {
        const consultasPaciente = await fetch(`${apiPrefix}Consulta/GetAllConsultasPaciente?email=${email}`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`
            }
        });

        consultasPacienteJson = await consultasPaciente.json();
    } catch (error) {
        console.error("Erro ao buscar consultas do paciente:", error);
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

// Função para buscar sugestões
function buscarSugestoes() {
    const input = document.getElementById("pesquisa-input");
    const listaSugestoes = document.getElementById("sugestoes-list");
    const termo = input.value.toLowerCase().trim(); // Adicionado trim() para evitar espaços em branco

    // Limpar sugestões anteriores
    listaSugestoes.innerHTML = "";

    if (termo) {
        const resultados = especialidadesJson.filter(especialidade =>
            especialidade.nome.toLowerCase().includes(termo)
        );

        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado.nome;
                item.onclick = () => selecionarSugestao(resultado.nome);
                listaSugestoes.appendChild(item);
            });
        } else {
            listaSugestoes.style.display = "none";
        }
    } else {
        listaSugestoes.style.display = "none";
    }
}

function selecionarSugestao(sugestao) {
    const input = document.getElementById("pesquisa-input");
    input.value = sugestao;
    document.getElementById("sugestoes-list").style.display = "none";
}

document.getElementById("pesquisa-input").addEventListener("input", buscarSugestoes);

document.getElementById("right-section").addEventListener("click", () => window.location.href = "./agenda.html");


function mostrarConsultas() {
    const consultasDoDia = consultasPacienteJson.filter(consulta =>  formatarData(consulta.dataConsulta) == new Date().toLocaleDateString() && consulta.situacao == "Agendada" );
    const consultasDoDiaDepoisDaHoraAtual = retornaConsultasMaioresQueHoraAtual(consultasDoDia);
    consultasDoDiaDepoisDaHoraAtual.length === 0 ? criaDivAgendaVazia(consultas) : consultasDoDiaDepoisDaHoraAtual.forEach(consulta => criaDivConsulta(consultas, consulta));
}

function criaDivConsulta(consultas, consulta) {
    const fotoSrc = consulta.fotoPerfilUrl === "" 
    ? "../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" 
    : consulta.fotoPerfilUrl;


    const nomeMedico = consulta.nomeMedico.length > 10 
        ? `Dr(a). ${consulta.nomeMedico.substring(0, 5)}...` 
        : `Dr(a). ${consulta.nomeMedico}`;

    consultas.innerHTML += `
        <div class="div-card">
            <img class="foto-medico" src="${fotoSrc}" alt="Foto do médico">
            <h3 class="nome-medico">${nomeMedico}</h3>
            <p class="especialidade">${consulta.especialidade}</p>
            <p class="horario">${consulta.horaInicio} - ${consulta.horaFim}</p>
        </div>
    `;
}

function criaDivAgendaVazia(consultas) {
    consultas.innerHTML = `<p class="mensagem">Por enquanto, nenhuma consulta até o final do dia.</p>`;
}

// Utils
function saudacao() {
    const dateTime = new Date();
    const hora = dateTime.getHours();
    
    if (hora >= 6 && hora < 12) 
        return "Bom dia"; 
    else if (hora >= 12 && hora < 18) 
        return "Boa tarde";
    return "Boa noite";
}

function formatarData (data) {
    return data.split('-').reverse().join('/');
}

function retornaConsultasMaioresQueHoraAtual (consultas) {
    let consultasMaioresQueHoraAtual = [];

    consultas.forEach(consulta => {
      const horaAtual = new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, 
        });
      const horaFimConsulta = consulta.horaFim;
      if (horaFimConsulta > horaAtual) 
        consultasMaioresQueHoraAtual.push(consulta);
    });
  
    return consultasMaioresQueHoraAtual;
}