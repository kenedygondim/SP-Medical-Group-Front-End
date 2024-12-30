document.addEventListener("DOMContentLoaded", async ( )=>  {
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
        window.location.href = "./perfil.html";
    });
});

// Função para buscar dados da API
async function fetchItems() {
    const token = sessionStorage.getItem("token"); // Recupera o token salvo
    const email = sessionStorage.getItem("email"); // Recupera o email salvo


    console.log(email);

    if (!email) {
        console.error("Erro: Email não encontrado no sessionStorage.");
        return;
    }

    try {
         const consultasMedico = await fetch(`http://localhost:8080/api/Consulta/ListarTodosConsultasMedico?email=${email}`, { //consultas passadas ou futuras realizadas pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Medico/InfoBasicasUsuario?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!consultasMedico.ok) {
            const errorMessage = await consultasMedico.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }
        if (!InfoBasicasUsuario.ok) {
            const errorMessage = await InfoBasicasUsuario.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        consultasMedicoJson = await consultasMedico.json(); // Assume que a resposta está no formato JSON
        const InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();

        document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
        document.getElementById("nome-medico-h2").textContent = `${saudacao()}, Dr(a). ${InfoBasicasUsuarioJson.nomeCompleto}!`;

        mostrarConsultas();

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}
 
// Função para buscar sugestões
function buscarSugestoes() {
    const input = document.getElementById("pesquisa-input");
    const listaSugestoes = document.getElementById("sugestoes-list");
    const termo = input.value.toLowerCase().trim(); // Adicionado trim() para evitar espaços em branco

    // Limpar sugestões anteriores
    listaSugestoes.innerHTML = "";

    items = Array.from(
        new Map(consultasMedicoJson.map(item => [item.cpfPaciente, item])).values()
    )

    console.log(items);

    if (termo) {
        const resultados = items.filter(paciente =>
            paciente.nomePaciente.toLowerCase().includes(termo)
        );

        // Mostrar sugestões
        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado.nomePaciente;
                item.onclick = () => selecionarSugestao(resultado.nomePaciente);
                listaSugestoes.appendChild(item);
            });
        } else {
            listaSugestoes.style.display = "none";
        }
    } else {
        listaSugestoes.style.display = "none";
    }
}

// Função para selecionar uma sugestão
function selecionarSugestao(sugestao) {
    const input = document.getElementById("pesquisa-input");
    input.value = sugestao;

    // Limpar a lista de sugestões
    document.getElementById("sugestoes-list").style.display = "none";
}

// Adiciona o evento de entrada no campo de pesquisa
document.getElementById("pesquisa-input").addEventListener("input", buscarSugestoes);


function mostrarConsultas() {
    const consultas = document.getElementById("appointments");

    console.log(consultasMedicoJson);


    // Adiciona efeito de saída
    consultas.classList.add('fade-out');
    
    // Aguarda o efeito de saída antes de atualizar o conteúdo
    setTimeout(() => {

        const consultasDoDia = consultasMedicoJson.filter(consulta => {
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
                nomeMedico.textContent =  consulta.nomePaciente.length > 10 ? consulta.nomePaciente.substring(0, 5) + "..." : "Dr(a). " + consulta.nomeMedico;
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

    }, 200); // Tempo do efeito de saída
}

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

function formatarData (data) {
    return data.split('-').reverse().join('/');
}