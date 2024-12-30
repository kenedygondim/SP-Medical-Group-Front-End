const currentDateHTML = document.getElementById('current-date');
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");
let currentDate = new Date();
let consultasMedicoJson = [];
let InfoBasicasUsuarioJson = [];
let disponibilidadesMedicoJson = [];

document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();
    createProfilePictureActions();    
    mostrarConsultas();
    currentDateHTML.textContent = currentDate.toLocaleDateString();    
});

async function fetchItems() {
    await acessar();
    await fetchConsultas();
    await fetchInfoBasicasUsuario();
    await fetchDisponibilidades();
}

document.getElementById("prev-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    fetchDisponibilidades();
    mostrarConsultas();
});

document.getElementById("next-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    fetchDisponibilidades();
    mostrarConsultas();
}); 

function mostrarConsultas() {
    const consultas = document.getElementById("appointments");
    consultas.classList.add('fade-out');
    
    setTimeout(() => {
        document.querySelectorAll(".div-card").forEach(e => e.remove());
        document.querySelectorAll(".div-card-principal").forEach(e => e.remove());



        const consultasDoDia = consultasMedicoJson.filter(consulta => {
            return formatarData(consulta.dataConsulta) == currentDateHTML.textContent;
        });

        let organizadorSupremo = [...disponibilidadesMedicoJson, ...consultasDoDia];


        organizadorSupremo = organizadorSupremo.sort((a, b) => {
            return new Date(trasnformaEmTimestamp(a.horaInicio)) - new Date(trasnformaEmTimestamp(b.horaInicio));
        });
        


        organizadorSupremo.forEach(org => {

            if(org.consultaId == null) {
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
            else {
                const divCardPrincipal = document.createElement("div");
                divCardPrincipal.className = "div-card-principal";

                const horarioP = document.createElement("p");
                horarioP.textContent = org.horaInicio + " - " + org.horaFim;
                horarioP.className = "horario";

                const divCard = document.createElement("div");
                divCard.className = "div-card";

                const fotoMedico = document.createElement("img");
                fotoMedico.src = org.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : org.fotoPerfilUrl;
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

                const horario = document.createElement("p");
                horario.textContent = org.horaInicio + " - " + org.horaFim;
                horario.className = "horario";

                divCard.appendChild(fotoMedico);
                divCard.appendChild(nomeMedico);
                divCard.appendChild(especialidade);
                divCard.appendChild(status);
                divCard.appendChild(horario);

                divCardPrincipal.appendChild(horarioP);
                divCardPrincipal.appendChild(divCard);

                consultas.appendChild(divCardPrincipal);
            }
            
        });

        consultas.classList.remove('fade-out');
        consultas.classList.add('fade-in');

    }, 200); // Tempo do efeito de saída
}


async function acessar() {
    const response = await fetch('http://localhost:8080/api/Consulta/Acessar', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if(response.status !== 200) {
        const errorMessage = await response.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }
}

async function fetchConsultas() {
    const consultasMedico = await fetch('http://localhost:8080/api/Consulta/ListarTodosConsultasMedico?email=' + email, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if(consultasMedico.status !== 200) {
        const errorMessage = await response.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    consultasMedicoJson = await consultasMedico.json();
}

async function fetchInfoBasicasUsuario() {
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

async function fetchDisponibilidades() {
    const disponibilidadesMedico = await fetch(`http://localhost:8080/api/Disponibilidade/ListarDisponibilidadesMedicoPorData?cpf=${InfoBasicasUsuarioJson.cpf}&data=${formatarDataInvertida(currentDate.toLocaleDateString())}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(disponibilidadesMedico.status !== 200) {
        const errorMessage = await disponibilidadesMedico.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }
    disponibilidadesMedicoJson = await disponibilidadesMedico.json();
}

function createProfilePictureActions() {
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

    document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
}

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