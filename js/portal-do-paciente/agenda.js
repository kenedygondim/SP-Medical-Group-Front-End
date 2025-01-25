const fotoPerfil = document.getElementById("fotoPerfil");
const nomeMedico = document.getElementById("nomeMedico");
const dataConsulta = document.getElementById("dataConsulta");
const horario = document.getElementById("horario");
const preco = document.getElementById("preco");
const endereco = document.getElementById("endereco");
const especialidade = document.getElementById("especialidade");

const currentDateHTML = document.getElementById('current-date');
let currentDate = new Date();

const loadingScreen = document.getElementById("loading-screen");

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();

    const profileContainer = document.getElementById("profile-container");
    const profileMenu = document.getElementById("profile-menu");
    const logoutOption = document.getElementById("logout");
    const viewProfileOption = document.getElementById("view-profile");

    document.getElementById("foto-perfil-options").addEventListener("click", () => {
        profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!profileContainer.contains(event.target)) {
            profileMenu.style.display = "none";
        }
    });

    logoutOption.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "http://127.0.0.1:5500/index.html";
    });

    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });

    loadingScreen.style.display = "none";
});


async function fetchItems() {
    const token = sessionStorage.getItem("token")
    const email = sessionStorage.getItem("email")
    
    const acesso = await fetch(`${apiPrefix}Consulta/Acessar`, {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
    }});
    
    if (acesso.status == 401) 
        window.location.href = "http://127.0.0.1:5500/html/login.html"
  
    const response = await fetch(`${apiPrefix}Consulta/GetAllConsultasPaciente?email=${email}`, {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    const InfoBasicasUsuario = await fetch(`${apiPrefix}Paciente/GetInfoBasicasUsuarioPaciente?email=${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    
    consultasPaciente = await response.json();

    const InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
    document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;

    currentDateHTML.textContent = currentDate.toLocaleDateString();
    mostrarConsultas();
}

document.getElementById("prev-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    mostrarConsultas();
});

document.getElementById("next-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    mostrarConsultas();
}); 

function mostrarConsultas() {    
    setTimeout(() => {
        const corpoTabela = document.getElementById("consultas-corpo");
        corpoTabela.innerHTML = ""; 
    
        const consultasDoDia = consultasPaciente.filter(consulta => {
            return formatarData(consulta.dataConsulta) == currentDateHTML.textContent;
        });

        if (consultasDoDia.length === 0) {
            criaLinhaAgendaVazia(corpoTabela);
            return;
        }

        consultasDoDia.forEach(consulta => {    
            criaLinhaConsulta(consulta, corpoTabela);
            });
    }, 200); 
}

function criaLinhaAgendaVazia(tbody) {
    tbody.innerHTML += `
        <tr>
            <td colspan="3" class="mensagem">Nenhuma consulta agendada para este dia. <span id="span-agenda-vazia" onclick="redirecionaPaginaAgendarConsultas()">Agendar consulta agora</span></td>
        </tr>`;
}

function criaLinhaConsulta(consulta, tbody) {
    tbody.innerHTML +=  `
    <tr>
        <td>${consulta.horaInicio}</td>
        <td>${consulta.horaFim}</td>
        <td>
            <div class="div-card" consulta-identificador="${consulta.consultaId}" onclick="showPopup('${consulta.consultaId}')">
                <img class="foto-medico" src="${consulta.fotoPerfilUrl}" alt="Foto do médico">
                <h3 class="nome-medico">Dr(a). ${consulta.nomeMedico}</h3>
                <p class="especialidade">${consulta.especialidade}</p>
                <p class="status">${consulta.situacao}</p>
            </div>
        </td>
    </tr>
    `;
}




async function showPopup(consultaIdentificador) {
      const consulta = consultasPaciente.find(consulta => consulta.consultaId == consultaIdentificador);

      fotoPerfil.src = consulta.fotoPerfilUrl;
      nomeMedico.textContent = consulta.nomeMedico
      dataConsulta.textContent = `${formatarData(consulta.dataConsulta)}`;
      horario.textContent = `${consulta.horaInicio} - ${consulta.horaFim}`;
      especialidade.textContent = `${consulta.especialidade}`;
      motivo.textContent = `${consulta.descricao}`;
      preco.textContent = `${consulta.preco}`; 

      !consulta.isTelemedicina ? endereco.textContent = `Endereço: ${consulta.logradouro}, ${consulta.numero} - ${consulta.bairro} - ${consulta.municipio} - ${consulta.uf}, ${consulta.cep}` : endereco.textContent = `Consulta Online via Google Meet`;
      
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
      document.getElementById("cancelarConsulta").addEventListener("click", async () => { await cancelarConsulta(consultaIdentificador) });
}

// Evento para fechar o pop-up
document.getElementById("closePopupBtn").addEventListener("click", closePopup);

function closePopup () {
    popupOverlay.style.display = "none";
}

function formatarData (data) {
    return data.split('-').reverse().join('/');
}

async function cancelarConsulta (consultaIdentificador) {
    const token = sessionStorage.getItem("token");

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
    }
}

function redirecionaPaginaAgendarConsultas() {
    window.location.href = "./agendar-consulta.html";
}