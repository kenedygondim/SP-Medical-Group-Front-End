// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const nomeMedicoTelaInicial = document.getElementById("nome-medico-h2");
const fotoPerfilOptions = document.getElementById("foto-perfil-options");
const input = document.getElementById("pesquisa-input");
const listaSugestoes = document.getElementById("sugestoes-list");
const consultas = document.getElementById("appointments");
const agendaMedico = document.getElementById("agenda-medico");


// Recuperação de informações de sessão
const token = sessionStorage.getItem("token"); 
const email = sessionStorage.getItem("email"); 

// Declaração de variáveis globais
let consultasMedicoJson = [];
let InfoBasicasUsuarioJson = {};

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de inicialização
document.addEventListener("DOMContentLoaded", async ( )=>  {
    await fetchItems();
    createProfilePictureActions();
    mostrarConsultas();
    nomeMedicoTelaInicial.textContent = `${saudacao()}, Dr(a). ${InfoBasicasUsuarioJson.nomeCompleto}!`;
    loadingScreen.style.display = "none";
});


// Função para buscar dados da API
async function fetchItems() {
    if (!token || !email) {
        alert("Ocorreu um erro ao tentar recuperar as informações de sessão. Por favor, faça login novamente.");
        window.location.href = "../../index.html";
    }

    await getConsultasMedico();
    await getDadosBasicosUsuario();
}

// Função de busca de todas as consultas do médico (Realizadas ou não)
async function getConsultasMedico() {
    try {
        const consultasMedico = await fetch(`${apiPrefix}Consulta/GetAllConsultasMedico?email=${email}`, { //consultas passadas ou futuras realizadas pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (consultasMedico.status !== 200) {
            const errorMessage = await consultasMedico.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        consultasMedicoJson = await consultasMedico.json(); // Assume que a resposta está no formato JSON
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// Função que busca as informações básicas do usuário (URL da foto de perfil, email, nome, CPF)
async function getDadosBasicosUsuario() {
    const InfoBasicasUsuario = await fetch(`${apiPrefix}Medico/GetInfoBasicasUsuarioMedico?email=${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (InfoBasicasUsuario.status !== 200) {
        if (InfoBasicasUsuario.status === 401) {
            alert("Sua sessão expirou. Faça login novamente.");
            window.location.href = "../../index.html";
        }
        const errorMessage = await InfoBasicasUsuario.text(); // Aguarda o texto da resposta
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

document.getElementById("right-section").addEventListener("click", () => window.location.href = "./agenda.html");


// Adiciona o evento de entrada no campo de pesquisa
input.addEventListener("input", buscarSugestoes);

// Função para buscar sugestões da barra de pesquisa conforme o usuário digita
function buscarSugestoes() {
    const termo = input.value.toLowerCase().trim(); 
    listaSugestoes.innerHTML = ""; // Limpar sugestões anteriores
    let items = Array.from( new Map(consultasMedicoJson.map(item => [item.cpfPaciente, item])).values()); // Remove duplicatas
    
    if (termo) {
        const resultados = items.filter(paciente => paciente.nomePaciente.toLowerCase().includes(termo));

        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado.nomePaciente;
                item.onclick = () => selecionarSugestao(resultado.nomePaciente);
                listaSugestoes.appendChild(item);
            });
        } else {
            listaSugestoes.style.display = "none";
    }
    } else {
        listaSugestoes.style.display = "none";
    }
}

// Função para selecionar uma sugestão
function selecionarSugestao(sugestao) {
    input.value = sugestao;
    listaSugestoes.style.display = "none";
}

// Função para mostrar as consultas do dia
function mostrarConsultas() {
    const consultasDoDia = consultasMedicoJson.filter(consulta => formatarData(consulta.dataConsulta) == new Date().toLocaleDateString() && consulta.situacao == "Agendada");
    const consultasDoDiaDepoisDaHoraAtual = retornaConsultasMaioresQueHoraAtual(consultasDoDia);
    consultasDoDiaDepoisDaHoraAtual.length === 0 ? criaDivAgendaVazia() : consultasDoDiaDepoisDaHoraAtual.forEach(consulta => criaDivConsulta(consulta));
}

function criaDivConsulta(consulta) {
    consultas.innerHTML += `
        <div class="div-card">
            <img class="foto-medico" src="${consulta.fotoPerfilUrl || '../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp'}" alt="Foto do paciente">
            <h3 class="nome-medico">${consulta.nomePaciente.length > 10 ? consulta.nomePaciente.substring(0, 5) + "..." : consulta.nomePaciente}</h3>
            <p class="especialidade">${consulta.especialidade}</p>
            <p class="horario">${consulta.horaInicio} - ${consulta.horaFim}</p>
        </div>`;
}

function criaDivAgendaVazia() {
    consultas.innerHTML += `<p class="mensagem">Por enquanto, nenhuma consulta até o final do dia.</p>`;
}

function saudacao() {
    const agora = new Date();
    const hora = agora.getHours();

    if (hora >= 6 && hora < 12) {
        return "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
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