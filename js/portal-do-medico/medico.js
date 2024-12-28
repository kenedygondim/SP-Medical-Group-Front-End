document.addEventListener("DOMContentLoaded", async ( )=>  {
    await fetchItems();
});

// Função para buscar dados da API
async function fetchItems() {
    const token = sessionStorage.getItem("token"); // Recupera o token salvo
    const email = sessionStorage.getItem("email"); // Recupera o email salvo

    if (!email) {
        console.error("Erro: Email não encontrado no sessionStorage.");
        return;
    }

    try {
        const medicosPaciente = await fetch(`http://localhost:8080/api/Paciente/ListarPacientesMedico?emailUsuario=${email}`, { //pacientes atendidos ou que serãoa atendidos pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
         });

         const consultasMedico = await fetch(`http://localhost:8080/api/Consulta/ListarTodosConsultasMedico?email=${email}`, { //consultas passadas ou futuras realizadas pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            }
        });

        const nomeMedico = await fetch(`http://localhost:8080/api/Medico/NomeECpfMedico?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });


        if (!medicosPaciente.ok || !consultasMedico.ok || !nomeMedico.ok) {
            const errorMessage = await response.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        items = await medicosPaciente.json(); // Assume que a resposta está no formato JSON
        items2 = await consultasMedico.json(); // Assume que a resposta está no formato JSON
        const nomePacienteJson = await nomeMedico.json();


        document.getElementById("nome-medico-h2").textContent = `${saudacao()}, Dr(a). ${nomePacienteJson.nomeCompleto}!`;



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

    if (termo) {
        const resultados = items.filter(paciente =>
            paciente.nomeCompleto.toLowerCase().includes(termo)
        );

        // Mostrar sugestões
        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado.nomeCompleto;
                item.onclick = () => selecionarSugestao(resultado.nomeCompleto);
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

// Botão de sair
document.getElementById("sair-btn").addEventListener("click", function () {
    sessionStorage.clear();
    window.location.href = "http://127.0.0.1:5500/index.html";
});

function mostrarConsultas() {
    const consultas = document.getElementById("appointments");

    // Adiciona efeito de saída
    consultas.classList.add('fade-out');
    
    // Aguarda o efeito de saída antes de atualizar o conteúdo
    setTimeout(() => {
        if (consultasPacienteJson.length > 0) {
            consultasPacienteJson.forEach(consulta => {    

                const divCard = document.createElement("div");
                divCard.className = "div-card";

                const fotoMedico = document.createElement("img");
                fotoMedico.src = consulta.fotoPerfilUrl;
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