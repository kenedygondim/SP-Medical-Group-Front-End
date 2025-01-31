// Referência a elementos HTML
const currentDateHTML = document.getElementById('current-date');
const loadingScreen = document.getElementById("loading-screen");

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
    const consultasMedico = await fetch(`${apiPrefix}Consulta/GetAllConsultasMedico?email=${email}`, {
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
    const InfoBasicasUsuario = await fetch(`${apiPrefix}Medico/GetInfoBasicasUsuarioMedico?email=${email}`, {
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
    const disponibilidadesMedico = await fetch(`${apiPrefix}Disponibilidade/GetDisponibilidadesMedicoNaoPreenchidas?cpf=${InfoBasicasUsuarioJson.cpf}&data=${formatarDataInvertida(currentDate.toLocaleDateString())}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(disponibilidadesMedico.status !== 200) {
        const errorMessage = await disponibilidadesMedico.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    disponibilidadesMedicoJson = await disponibilidadesMedico.json();

    console.log(disponibilidadesMedicoJson);
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    const profileContainer = document.getElementById("profile-container");
    const profileMenu = document.getElementById("profile-menu");
    const logoutOption = document.getElementById("logout");
    const viewProfileOption = document.getElementById("view-profile");
    const fotoPerfilOptions = document.getElementById("foto-perfil-options");


    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "SP-Medical-Group-Front-End/"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Função que exibe as Agenda e horários disponíveis do médico no dia selecionado
function mostrarConsultas() {
    setTimeout(() => {
        const corpoTabela = document.getElementById("consultas-corpo");
        corpoTabela.innerHTML = ""; // Limpa as linhas da tabela

        const consultasDoDia = consultasMedicoJson.filter(
            consulta => formatarData(consulta.dataConsulta) === currentDateHTML.textContent
        );

        const disponibilidadesConsultasMesclado = [
            ...disponibilidadesMedicoJson,
            ...consultasDoDia
        ].sort((a, b) => 
            new Date(trasnformaEmTimestamp(a.horaInicio)) - new Date(trasnformaEmTimestamp(b.horaInicio))
        );

        if (disponibilidadesConsultasMesclado.length === 0) {
            criaLinhaAgendaVazia(corpoTabela);
            return;
        }

        disponibilidadesConsultasMesclado.forEach(org => {
            if (org.consultaId == null) {
                criaLinhaDisponibilidadeNaoPreenchida(org, corpoTabela);
            } else {
                criaLinhaConsulta(org, corpoTabela);
            }
        });
    }, 200);
}

function criaLinhaAgendaVazia(tbody) {
    tbody.innerHTML += `
        <tr>
            <td colspan="3" class="mensagem">Agenda vazia. <span id="span-agenda-vazia" onclick="redirecionaPaginaDisponibilidades()">Adicione horários na agenda</span></td>
        </tr>`;
}

function criaLinhaDisponibilidadeNaoPreenchida(org, tbody) {
    tbody.innerHTML += `
        <tr>
            <td>${org.horaInicio}</td>
            <td>${org.horaFim}</td>
            <td>
                <p class="div-card-dashed-text">Horário não preenchido. Clique <span id="span-excluir-disp" onclick="excluirDisponibilidade(${org.disponibilidadeId})">aqui</span> para excluir</p>
            </td>
        </tr>`;
}

function criaLinhaConsulta(org, tbody) {
    tbody.innerHTML += `
        <tr>
            <td>${org.horaInicio}</td>
            <td>${org.horaFim}</td>
            <td>
                <div class="div-card" consulta-identificador="${org.consultaId}" onclick="showPopup('${org.consultaId}')">
                    <img class="foto-medico" src="${org.fotoPerfilUrl || 'https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT'}" alt="Foto do médico">
                    <h3 class="nome-medico">${org.nomePaciente}</h3>
                    <p class="especialidade">${org.especialidade}</p>
                    <p class="status">${org.situacao}</p>
                </div>
            </td>
        </tr>`;
}

function redirecionaPaginaDisponibilidades() {
    window.location.href = "./disponibilidades.html";
}

// Função para retroceder um dia na agenda
document.getElementById("prev-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    getDisponibilidadesPelaData();
    mostrarConsultas();
});

// Função para avançar um dia na agenda
document.getElementById("next-day").addEventListener('click', () => {
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
    const fotoPerfil = document.getElementById("fotoPerfil");
    const nomePaciente = document.getElementById("nomeMedico");
    const dataConsulta = document.getElementById("dataConsulta");
    const horario = document.getElementById("horario");
    const preco = document.getElementById("preco");
    const endereco = document.getElementById("endereco");
    const especialidade = document.getElementById("especialidade");
    const motivo = document.getElementById("motivo");

    const consulta = consultasMedicoJson.find(consulta => consulta.consultaId == consultaIdentificador);

      fotoPerfil.src = consulta.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : consulta.fotoPerfilUrl;
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

// Evento para fechar o pop-up
document.getElementById("closePopupBtn").addEventListener("click", closePopup);

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
        await fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}

async function excluirDisponibilidade(disponibilidadeId) {
    const confirmacaoExclusaoDisp = confirm("Deseja realmente excluir a disponibilidade?") 
    
    if (!confirmacaoExclusaoDisp) return;

    try {
        const response = await fetch(`${apiPrefix}Disponibilidade/ExcluirDisponibilidade?disponibilidadeId=${disponibilidadeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        response.status == 204 ? alert("Disponibilidade excluída com sucesso.") : alert("Não foi possível excluir a disponibilidade.");
        await fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}