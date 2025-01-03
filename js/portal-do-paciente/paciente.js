const email = sessionStorage.getItem("email"); // Recupera o email salvo
const token = sessionStorage.getItem("token"); // Recupera o token salvo
const loadingScreen = document.getElementById("loading-screen");

let especialidadesJson = [];
let infoBasicasUsuarioJson = {};
let consultasPacienteJson = [];

document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    carregarFotoPerfilOptions();
    mostrarConsultas();
    document.getElementById("nome-paciente-h2").textContent = `${saudacao()}, ${infoBasicasUsuarioJson.nomeCompleto}!`;
    loadingScreen.style.display = "none";
});

async function fetchItems() {
    await GetEspecialidades();
    await GetInfoBasicasUsuario();
    await GetConsultasPaciente();
}

async function GetEspecialidades() {
    try {
        const response = await fetch(`http://localhost:8080/api/Especialidade/ListarTodos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        especialidadesJson = await response.json();

    } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
    }
}

async function GetInfoBasicasUsuario() {
    try {
        const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Paciente/InfoBasicasUsuario?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        infoBasicasUsuarioJson = await InfoBasicasUsuario.json();
    } catch (error) {
        console.error("Erro ao buscar informações básicas do usuário:", error);
    }
}

async function GetConsultasPaciente() {
    try {
        const consultasPaciente = await fetch(`http://localhost:8080/api/Consulta/ListarTodasConsultasPaciente?email=${email}`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`
            }
        });

        consultasPacienteJson = await consultasPaciente.json();
    } catch (error) {
        console.error("Erro ao buscar consultas do paciente:", error);
    }
}


function carregarFotoPerfilOptions() {
    const profileContainer = document.getElementById("profile-container");
    const profileMenu = document.getElementById("profile-menu");
    const logoutOption = document.getElementById("logout");
    const viewProfileOption = document.getElementById("view-profile");
    const fotoPerfilOptions = document.getElementById("foto-perfil-options");

    fotoPerfilOptions.src = infoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : infoBasicasUsuarioJson.fotoPerfilUrl;


    fotoPerfilOptions.addEventListener("click", () => {
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
}

// Função para buscar sugestões
function buscarSugestoes() {
    const input = document.getElementById("pesquisa-input");
    const listaSugestoes = document.getElementById("sugestoes-list");
    const termo = input.value.toLowerCase().trim(); // Adicionado trim() para evitar espaços em branco

    // Limpar sugestões anteriores
    listaSugestoes.innerHTML = "";

    if (termo) {
        const resultados = especialidadesJson.filter(especialidade =>
            especialidade.nome.toLowerCase().includes(termo)
        );

        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado.nome;
                item.onclick = () => selecionarSugestao(resultado.nome);
                listaSugestoes.appendChild(item);
            });
        } else {
            listaSugestoes.style.display = "none";
        }
    } else {
        listaSugestoes.style.display = "none";
    }
}

function selecionarSugestao(sugestao) {
    const input = document.getElementById("pesquisa-input");
    input.value = sugestao;
    document.getElementById("sugestoes-list").style.display = "none";
}

document.getElementById("pesquisa-input").addEventListener("input", buscarSugestoes);


function saudacao() {
    const agora = new Date();
    const hora = agora.getHours();
    
    if (hora >= 6 && hora < 12) {
        return "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }

}

function mostrarConsultas() {
    const consultas = document.getElementById("appointments");

    // Adiciona efeito de saída
    consultas.classList.add('fade-out');
    

        const consultasDoDia = consultasPacienteJson.filter(consulta => {
            return formatarData(consulta.dataConsulta) == new Date().toLocaleDateString()
        });

        if (consultasDoDia.length > 0) {
            consultasDoDia.forEach(consulta => {    

                const divCard = document.createElement("div");
                divCard.className = "div-card";

                const fotoMedico = document.createElement("img");
                fotoMedico.src = consulta.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : consulta.fotoPerfilUrl;
                fotoMedico.className = "foto-medico";

                const nomeMedico = document.createElement("h3");
                nomeMedico.textContent =  consulta.nomeMedico.length > 10 ? "Dr(a). " + consulta.nomeMedico.substring(0, 5) + "..." : "Dr(a). " + consulta.nomeMedico;
                nomeMedico.className = "nome-medico";

                const especialidade = document.createElement("p");
                especialidade.textContent = consulta.especialidade;
                especialidade.className = "especialidade";

                const horario = document.createElement("p");
                horario.textContent = consulta.horaInicio + " - " + consulta.horaFim;
                horario.className = "horario";

                divCard.appendChild(fotoMedico);
                divCard.appendChild(nomeMedico);
                divCard.appendChild(especialidade);
                divCard.appendChild(horario);


                consultas.appendChild(divCard);
            });
        } else {
            const agendaMedico = document.getElementById("agenda-medico");
            agendaMedico.style.backgroundColor = "transparent";
            agendaMedico.style.border = "1px dashed green"

            const mensagem = document.createElement("p");
            mensagem.textContent = "Nenhuma consulta agendada para este dia.";
            mensagem.className = "mensagem";

            consultas.appendChild(mensagem);
        }

        // Adiciona efeito de entrada
        consultas.classList.remove('fade-out');
        consultas.classList.add('fade-in');

}

function formatarData (data) {
    return data.split('-').reverse().join('/');
}