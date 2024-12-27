document.addEventListener("DOMContentLoaded", fetchItems);

let items;
let items2;

// Função para buscar dados da API
async function fetchItems() {
    const token = sessionStorage.getItem("token"); // Recupera o token salvo
    const email = sessionStorage.getItem("email"); // Recupera o email salvo

    if (!email) {
        console.error("Erro: Email não encontrado no sessionStorage.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/Paciente/ListarPacientesMedico?emailUsuario=${email}`, { //pacientes atendidos ou que serãoa atendidos pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
         });

         const response2 = await fetch(`http://localhost:8080/api/Consulta/ListarTodosConsultasMedico?email=${email}`, { //consultas passadas ou futuras realizadas pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });


        if (!response.ok) {
            const errorMessage = await response.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        if (!response2.ok) {
            const errorMessage = await response2.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }
        items = await response.json(); // Assume que a resposta está no formato JSON
        items2 = await response2.json(); // Assume que a resposta está no formato JSON
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
