const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

const loadingScreen = document.getElementById("loading-screen");

document.addEventListener('DOMContentLoaded', async () => {
    await fetchInfoBasicasUsuario();
    createProfilePictureActions();
    loadingScreen.style.display = "none";
});


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



document.getElementById('availabilityForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const body = {
        emailMedico: sessionStorage.getItem('email'),
        dataDisp: date,
        horaInicio: startTime,
        horaFim: endTime
    };

    await fetch('http://localhost:8080/api/Disponibilidade/adicionar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then((response) => {
        if (response.ok) {
            alert('Disponibilidade cadastrada com sucesso!');
        } else {
            alert('Erro ao cadastrar disponibilidade!');
        }
    });
});
