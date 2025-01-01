document.addEventListener("DOMContentLoaded", async () => {
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
        window.location.href = "../index.html";
    });

    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });
});

async function fetchItems() {
    const token = sessionStorage.getItem("token");
    const email = sessionStorage.getItem("email");

    if (!email) {
        console.error("Erro: Email não encontrado no sessionStorage.");
        return;
    }

    try {
        const perfilCompletoMedico= await fetch(`http://localhost:8080/api/Medico/PerfilCompletoMedico?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!perfilCompletoMedico.ok) {
            const errorMessage = await perfilCompletoMedico.text();
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        const perfilCompletoMedicoJson = await perfilCompletoMedico.json();

        document.getElementById("nome-completo").textContent = perfilCompletoMedicoJson.nomeCompleto;
        document.getElementById("data-nascimento").value = perfilCompletoMedicoJson.dataNascimento;
        document.getElementById("rg").value = perfilCompletoMedicoJson.rg;
        document.getElementById("cpf").value = perfilCompletoMedicoJson.cpf;
        document.getElementById("email").value = perfilCompletoMedicoJson.email;
        document.getElementById("cep").value = perfilCompletoMedicoJson.cep;
        // document.getElementById("logradouro").value = perfilCompletoMedicoJson.logradouro;
        document.getElementById("numero").value = perfilCompletoMedicoJson.numero;
        document.getElementById("bairro").value = perfilCompletoMedicoJson.bairro;
        document.getElementById("municipio").value = perfilCompletoMedicoJson.municipio;
        document.getElementById("uf").value = perfilCompletoMedicoJson.uf;
        document.getElementById("complemento").value = perfilCompletoMedicoJson.complemento;
        document.getElementById("crm").value = perfilCompletoMedicoJson.crm;
        document.getElementById("hospital").value = perfilCompletoMedicoJson.hospital;

        document.getElementById("foto-perfil-options").src = perfilCompletoMedicoJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : perfilCompletoMedicoJson.fotoPerfilUrl;

        const profileImage = document.getElementById("profile-image");
        profileImage.src = perfilCompletoMedicoJson.fotoPerfilUrl || "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp";
    } catch (error) {
        console.error(error);
    }
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

    // Adicionar lógica de salvamento aqui
});