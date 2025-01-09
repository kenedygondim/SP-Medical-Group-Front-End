// Referência a elementos HTML
const currentDateHTML = document.getElementById('current-date');
const loadingScreen = document.getElementById("loading-screen");
const previewDay = document.getElementById("prev-day");
const nextDay = document.getElementById("next-day");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const fotoPerfilOptions = document.getElementById("foto-perfil-options");
const consultas = document.getElementById("appointments");
const closePopupBtn = document.getElementById("closePopupBtn");
const fotoPerfil = document.getElementById("fotoPerfil");
const nomePaciente = document.getElementById("nomeMedico");
const dataConsulta = document.getElementById("dataConsulta");
const horario = document.getElementById("horario");
const preco = document.getElementById("preco");
const endereco = document.getElementById("endereco");
const especialidade = document.getElementById("especialidade");
const motivo = document.getElementById("motivo");

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

// Declaração de variáveis globais
let currentDate = new Date();
let consultasMedicoJson = [];
let InfoBasicasUsuarioJson = [];
let disponibilidadesMedicoJson = [];

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();
    createProfilePictureActions();    
    mostrarConsultas();
    currentDateHTML.textContent = currentDate.toLocaleDateString();   
    loadingScreen.style.display = "none"; 
});

// Função de busca de informações no servidor
async function fetchItems() { 
    await acessar();
    await getConsultasMedico();
    await getDadosBasicosUsuario();
    await getDisponibilidadesPelaData();
}

// Função de acesso à pagina
async function acessar() {
    const response = await fetch(`${apiPrefix}Consulta/Acessar`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if(response.status !== 200) {
        const errorMessage = await response.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }
}

// Função de busca de todas as consultas do médico (Realizadas ou não)
async function getConsultasMedico() {
    const consultasMedico = await fetch(`${apiPrefix}Consulta/ListarTodosConsultasMedico?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if(consultasMedico.status !== 200) {
        const errorMessage = await response.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    consultasMedicoJson = await consultasMedico.json();
}

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

// Função que busca as disponibilidades do médico na data atual
async function  getDisponibilidadesPelaData() {
    const disponibilidadesMedico = await fetch(`${apiPrefix}Disponibilidade/ListarDisponibilidadesMedicoPorData?cpf=${InfoBasicasUsuarioJson.cpf}&data=${formatarDataInvertida(currentDate.toLocaleDateString())}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(disponibilidadesMedico.status !== 200) {
        const errorMessage = await disponibilidadesMedico.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    disponibilidadesMedicoJson = await disponibilidadesMedico.json();
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Função que exibe as consultas agendadas e horários disponíveis do médico no dia selecionado
function mostrarConsultas() {
    setTimeout(() => {
        document.querySelectorAll(".div-card").forEach(e => e.remove());
        document.querySelectorAll(".div-card-principal").forEach(e => e.remove());
        document.querySelectorAll(".div-card-none").forEach(e => e.remove());

        const consultasDoDia = consultasMedicoJson.filter(consulta => formatarData(consulta.dataConsulta) == currentDateHTML.textContent);
        const disponibilidadesConsultasMesclado = [...disponibilidadesMedicoJson, ...consultasDoDia].sort((a, b) => new Date(trasnformaEmTimestamp(a.horaInicio)) - new Date(trasnformaEmTimestamp(b.horaInicio)));

        if(disponibilidadesConsultasMesclado.length == 0) {
            criaDivAgendaVazia();
            return;
        }
        
        disponibilidadesConsultasMesclado.forEach(org => {
            if(org.consultaId == null) 
                criaDivDisponibilidadeNaoPreenchida(org);
            else
                criaDivConsulta(org);
        });
    }, 200); 
}


function criaDivAgendaVazia() {
    const divCardNone = document.createElement("div");
    divCardNone.className = "div-card-none";
    const mensagem = document.createElement("p");
    mensagem.textContent = "Agenda vazia.";
    mensagem.className = "mensagem";
    divCardNone.appendChild(mensagem);
    consultas.appendChild(divCardNone);
}

function criaDivDisponibilidadeNaoPreenchida(org) {
    const divCardPrincipal = document.createElement("div");
    divCardPrincipal.className = "div-card-principal";
    const horario = document.createElement("p");
    horario.textContent = org.horaInicio + " - " + org.horaFim;
    horario.className = "horario";
    const divCardDashed = document.createElement("div");
    divCardDashed.className = "div-card-dashed";
    const divCardDashedText = document.createElement("p");
    divCardDashedText.textContent = "Horário não preenchido";
    divCardDashedText.className = "div-card-dashed-text";
    divCardDashed.appendChild(divCardDashedText);
    divCardPrincipal.appendChild(horario);
    divCardPrincipal.appendChild(divCardDashed);
    consultas.appendChild(divCardPrincipal);
}

function criaDivConsulta(org) {
    const divCardPrincipal = document.createElement("div");
    divCardPrincipal.className = "div-card-principal";
    const horario = document.createElement("p");
    horario.textContent = org.horaInicio + " - " + org.horaFim;
    horario.className = "horario";
    const divCard = document.createElement("div");
    divCard.className = "div-card";
    divCard.setAttribute('consulta-identificador', org.consultaId);
    const fotoMedico = document.createElement("img");
    fotoMedico.src = org.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : org.fotoPerfilUrl;
    fotoMedico.className = "foto-medico";
    const nomeMedico = document.createElement("h3");
    nomeMedico.textContent = org.nomePaciente;
    nomeMedico.className = "nome-medico";
    const especialidade = document.createElement("p");
    especialidade.textContent = org.especialidade;
    especialidade.className = "especialidade";
    const status = document.createElement("p");
    status.textContent = org.situacao;
    status.className = "status";
    const horarioConsulta = document.createElement("p");
    horarioConsulta.textContent = org.horaInicio + " - " + org.horaFim;
    horarioConsulta.className = "horario";
    divCard.appendChild(fotoMedico);
    divCard.appendChild(nomeMedico);
    divCard.appendChild(especialidade);
    divCard.appendChild(status);
    divCard.appendChild(horarioConsulta);
    divCardPrincipal.appendChild(horario);
    divCardPrincipal.appendChild(divCard);
    divCard.addEventListener('click', () => {
        const consultaIdentificador = divCard.getAttribute('consulta-identificador');
        showPopup(consultaIdentificador);
    });
    consultas.appendChild(divCardPrincipal);
}

// Função para retroceder um dia na agenda
previewDay.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    getDisponibilidadesPelaData();
    mostrarConsultas();
});

// Função para avançar um dia na agenda
nextDay.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    getDisponibilidadesPelaData();
    mostrarConsultas();
});


// Utilidades
function formatarData (data) {
    return data.split('-').reverse().join('/');
}

function formatarDataInvertida (data) {
    return data.split('/').reverse().join('-');
}

function trasnformaEmTimestamp(horaInicio) {
    const dataDisp = formatarDataInvertida(currentDateHTML.textContent);
    return `${dataDisp}T${horaInicio}:00`
}

// Função para decodificar o token JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token inválido', error);
        return null;
    }
}

// Função para mostrar o pop-up
async function showPopup(consultaIdentificador) {
    try {
      const consulta = consultasMedicoJson.find(consulta => consulta.consultaId == consultaIdentificador);

      fotoPerfil.src = consulta.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : consulta.fotoPerfilUrl;
      nomePaciente.textContent = consulta.nomePaciente
      dataConsulta.textContent = `${formatarData(consulta.dataConsulta)}`;
      horario.textContent = `${consulta.horaInicio} - ${consulta.horaFim}`;
      especialidade.textContent = `${consulta.especialidade}`;
      motivo.textContent = `${consulta.descricao}`;
      preco.textContent = `R$ ${consulta.preco}`;

      !consulta.isTelemedicina ? endereco.textContent = `${consulta.logradouro}, ${consulta.numero} - ${consulta.bairro} - ${consulta.municipio} - ${consulta.uf}, ${consulta.cep}` : endereco.textContent = `Consulta Online via Google Meet`;
      
      if (consulta.situacao == "Concluída") {
        document.getElementById("actions").style.display = "none";
        document.getElementById("div-consulta-concluida").style.display = "flex";
      }
      else {
        document.getElementById("actions").style.display = "flex";
        document.getElementById("div-consulta-concluida").style.display = "none";
      }

      popupOverlay.style.display = "flex";
      popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent);
      document.getElementById("cancelar-consulta").addEventListener("click", async () => { await cancelarConsulta(consultaIdentificador) });
      document.getElementById("marcar-concluida").addEventListener("click", async () => { await marcarConsultaComoConcluida(consultaIdentificador) });
    }
    catch (error) {
      console.error(error.message);
    }
}

// Evento para fechar o pop-up
closePopupBtn.addEventListener("click", closePopup);

function closePopup() {
    popupOverlay.style.display = "none";
}

// Função para cancelar a consulta
async function cancelarConsulta (consultaIdentificador) {
    try {
        const response = await fetch(`${apiPrefix}Consulta/CancelarConsulta?consultaId=${consultaIdentificador}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        response.status == 204 ? alert("Consulta cancelada com sucesso.") : alert("Não foi possível cancelar a consulta.");
        fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}

// Função para marcar a consulta como concluída
async function marcarConsultaComoConcluida (consultaIdentificador) {
    try {
        const response = await fetch(`${apiPrefix}Consulta/MarcarConsultaComoConcluida?consultaId=${consultaIdentificador}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        response.status == 204 ? alert("Consulta marcada como concluída com sucesso.") : alert("Não foi possível marcar a consulta como concluída.");
        fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}