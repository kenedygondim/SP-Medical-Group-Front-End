const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

let perfilCompletoPacienteJson = {};

const loadingScreen = document.getElementById("loading-screen");

document.addEventListener("DOMContentLoaded", async () => {
    await GetPerfil();
    carregarFotoPerfilOptions();
    loadingScreen.style.display = "none";
});

function carregarFotoPerfilOptions() {
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
        window.location.href = "../../index.html";
    });

    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });
};

async function GetPerfil() {
    try {
        const perfilCompletoPaciente = await fetch(`http://localhost:8080/api/Paciente/PerfilCompletoPaciente?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!perfilCompletoPaciente.ok) {
            const errorMessage = await perfilCompletoPaciente.text();
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        perfilCompletoPacienteJson = await perfilCompletoPaciente.json();
    } catch (error) {
        console.error(error);
    }
}

function montarPerfilCompletoPaciente() {
    document.getElementById("nome-completo").textContent = perfilCompletoPacienteJson.nomeCompleto;
    document.getElementById("data-nascimento").value = perfilCompletoPacienteJson.dataNascimento;
    document.getElementById("rg").value = perfilCompletoPacienteJson.rg;
    document.getElementById("cpf").value = perfilCompletoPacienteJson.cpf;
    document.getElementById("email").value = perfilCompletoPacienteJson.email;
    document.getElementById("cep").value = perfilCompletoPacienteJson.cep;
    document.getElementById("numero").value = perfilCompletoPacienteJson.numero;
    document.getElementById("bairro").value = perfilCompletoPacienteJson.bairro;
    document.getElementById("municipio").value = perfilCompletoPacienteJson.municipio;
    document.getElementById("uf").value = perfilCompletoPacienteJson.uf;
    document.getElementById("complemento").value = perfilCompletoPacienteJson.complemento;
    document.getElementById("foto-perfil-options").src = perfilCompletoPacienteJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : perfilCompletoPacienteJson.fotoPerfilUrl;

    const profileImage = document.getElementById("profile-image");
    profileImage.src = perfilCompletoPacienteJson.fotoPerfilUrl || "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp";
}

document.getElementById('salvar').addEventListener('click', () => {
    const senhaAntigaInput = document.getElementById('senha-antiga');
    const senhaAntigaError = document.getElementById('senha-antiga-error');

    if (senhaAntigaInput.value !== "senhaEsperada") { // Substituir por lógica real de validação
        senhaAntigaInput.classList.add('error');
        senhaAntigaError.style.display = 'block';
    } else {
        senhaAntigaInput.classList.remove('error');
        senhaAntigaError.style.display = 'none';
    }
});