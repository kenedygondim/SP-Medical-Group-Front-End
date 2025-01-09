// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const fotoPerfilOptions = document.getElementById("foto-perfil-options");
const profileImage = document.getElementById("profile-image");

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token"); 
const email = sessionStorage.getItem("email"); 

// Declaração de variáveis globais
let perfilCompletoMedicoJson = {};

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de inicialização
document.addEventListener("DOMContentLoaded", async () => {
    await getPerfilCompletoMedico();
    createProfilePictureActions();
    montaPerfilCompletoMedico();
    loadingScreen.style.display = "none";
});

// Função que busca todas as informações do médico no BD
async function getPerfilCompletoMedico() {
    try {
        const perfilCompletoMedico= await fetch(`${apiPrefix}Medico/PerfilCompletoMedico?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (perfilCompletoMedico.status !== 200) {
            const errorMessage = await perfilCompletoMedico.text();
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        perfilCompletoMedicoJson = await perfilCompletoMedico.json();
    } catch (error) {
        console.error(error);
    }
}

// Função que seta os valores recuperados do banco de dados nos devidos campos HTML
function montaPerfilCompletoMedico() {
    document.getElementById("nome-completo").textContent = perfilCompletoMedicoJson.nomeCompleto;
    document.getElementById("data-nascimento").value = perfilCompletoMedicoJson.dataNascimento;
    document.getElementById("rg").value = perfilCompletoMedicoJson.rg;
    document.getElementById("cpf").value = perfilCompletoMedicoJson.cpf;
    document.getElementById("email").value = perfilCompletoMedicoJson.email;
    document.getElementById("cep").value = perfilCompletoMedicoJson.cep;
    document.getElementById("numero").value = perfilCompletoMedicoJson.numero;
    document.getElementById("bairro").value = perfilCompletoMedicoJson.bairro;
    document.getElementById("municipio").value = perfilCompletoMedicoJson.municipio;
    document.getElementById("uf").value = perfilCompletoMedicoJson.uf;
    document.getElementById("complemento").value = perfilCompletoMedicoJson.complemento;
    document.getElementById("crm").value = perfilCompletoMedicoJson.crm;
    document.getElementById("hospital").value = perfilCompletoMedicoJson.hospital;
    profileImage.src = perfilCompletoMedicoJson.fotoPerfilUrl || "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp";

}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = perfilCompletoMedicoJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : perfilCompletoMedicoJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// document.getElementById('salvar').addEventListener('click', () => {
//     const senhaAntigaInput = document.getElementById('senha-antiga');
//     const senhaAntigaError = document.getElementById('senha-antiga-error');

//     if (senhaAntigaInput.value !== "senhaEsperada") { 
//         senhaAntigaInput.classList.add('error');
//         senhaAntigaError.style.display = 'block';
//     } else {
//         senhaAntigaInput.classList.remove('error');
//         senhaAntigaError.style.display = 'none';
//     }
// });