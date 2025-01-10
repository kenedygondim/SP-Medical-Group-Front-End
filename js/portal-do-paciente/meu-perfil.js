const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

let perfilCompletoPacienteJson = {};

const loadingScreen = document.getElementById("loading-screen");

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

document.addEventListener("DOMContentLoaded", async () => {
    await GetPerfil();
    carregarFotoPerfilOptions();
    montarPerfilCompletoPaciente();
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
        const perfilCompletoPaciente = await fetch(`${apiPrefix}Paciente/PerfilCompletoPaciente?email=${email}`, {
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
    document.getElementById("foto-perfil-options").src = perfilCompletoPacienteJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : perfilCompletoPacienteJson.fotoPerfilUrl;

    const profileImage = document.getElementById("profile-image");

    const fileInput = document.getElementById("file-input");

    const profileImageDiv = document.getElementById("profile-image-div");

    profileImage.src = perfilCompletoPacienteJson.fotoPerfilUrl || "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp";

    const overlay = document.getElementById("overlay");

    profileImage.addEventListener("mouseover", () => {
        profileImage.style.opacity = "0.7";
        profileImage.style.cursor = "pointer";
        overlay.style.opacity = "1";  // Exibe a sobreposição
    });

    profileImage.addEventListener("mouseout", () => {
        profileImage.style.opacity = "1";  // Restaura a opacidade da imagem
        overlay.style.opacity = "0";  // Esconde a sobreposição
    });

    profileImageDiv.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", async (event) => {

        loadingScreen.style.display = "flex";

        const file = event.target.files[0];
        if (file) {
            await atualizarFotoPerfil(file);
        }

        loadingScreen.style.display = "none";

    });
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


async function atualizarFotoPerfil(file) {
    try {
        const formData = new FormData();
        formData.append('novaFotoPerfil', file);

        console.log([...formData.entries()]);
        

        const response = await fetch(`${apiPrefix}FotoPerfil/AlterarFotoPerfil?email=${email}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status == 400) {
            throw new Error("Erro ao atualizar foto de perfil");
        }

        const responseJson = await response.json();

        alert("Foto de perfil atualizada com sucesso");

        window.location.reload();

    } catch (error) {
        alert('Erro ao atualizar foto de perfil');
        console.error(error);   
    }

}