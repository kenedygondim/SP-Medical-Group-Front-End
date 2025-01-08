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
    
    const acesso = await fetch('http://localhost:8080/api/Consulta/Acessar', {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
    }});
    
    if (acesso.status == 401) 
        window.location.href = "http://127.0.0.1:5500/html/login.html"
  
    const response = await fetch('http://localhost:8080/api/Consulta/ListarTodasConsultasPaciente?email=' + sessionStorage.getItem("email"), {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Paciente/InfoBasicasUsuario?email=${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    
    consultasPaciente = await response.json();

    const InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
    document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;

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
    const consultas = document.getElementById("appointments");

    // Adiciona efeito de saída
    consultas.classList.add('fade-out');
    
    // Aguarda o efeito de saída antes de atualizar o conteúdo
    setTimeout(() => {
        document.querySelectorAll(".div-card").forEach(e => e.remove());
        document.querySelectorAll(".div-card-none").forEach(e => e.remove());


        console.log(consultasPaciente);

        const consultasDoDia = consultasPaciente.filter(consulta => {
            return formatarData(consulta.dataConsulta) == currentDateHTML.textContent;
        });

        if (consultasDoDia.length > 0) {
            consultasDoDia.forEach(consulta => {    

                const divCard = document.createElement("div");
                divCard.className = "div-card";

                divCard.setAttribute('consulta-identificador', consulta.consultaId);


                const fotoMedico = document.createElement("img");
                fotoMedico.src = consulta.fotoPerfilUrl;
                fotoMedico.className = "foto-medico";

                const nomeMedico = document.createElement("h3");
                nomeMedico.textContent = "Dr(a). " + consulta.nomeMedico;
                nomeMedico.className = "nome-medico";


                const especialidade = document.createElement("p");
                especialidade.textContent = consulta.especialidade;
                especialidade.className = "especialidade";

                const status = document.createElement("p");
                status.textContent = consulta.situacao;
                status.className = "status";

                const horario = document.createElement("p");
                horario.textContent = consulta.horaInicio + " - " + consulta.horaFim;
                horario.className = "horario";

                divCard.appendChild(fotoMedico);
                divCard.appendChild(nomeMedico);
                divCard.appendChild(especialidade);
                divCard.appendChild(status);
                divCard.appendChild(horario);

                divCard.addEventListener('click', () => {
                    const consultaIdentificador = divCard.getAttribute('consulta-identificador');
                    showPopup(consultaIdentificador);
                });

                consultas.appendChild(divCard);
            });
        } else {
            const divCardNone = document.createElement("div");
            divCardNone.className = "div-card-none";

            const mensagem = document.createElement("p");
            mensagem.textContent = "Nenhuma consulta agendada para este dia.";
            mensagem.className = "mensagem";

            divCardNone.appendChild(mensagem);

            consultas.appendChild(divCardNone);
        }

        // Adiciona efeito de entrada
        consultas.classList.remove('fade-out');
        consultas.classList.add('fade-in');

    }, 200); // Tempo do efeito de saída
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
        const response = await fetch(`http://localhost:8080/api/Consulta/CancelarConsulta?consultaId=${consultaIdentificador}`, {
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