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
        const response = await fetch(`http://localhost:8080/api/Especialidade/ListarTodos`, { //pacientes atendidos ou que serãoa atendidos pelo médico
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
         });

        if (!response.ok) {
            const errorMessage = await response.text(); // Aguarda o texto da resposta
            throw new Error(`Erro na requisição: ${errorMessage}`);
        }

        items = await response.json(); 

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
        const resultados = items.filter(especialidade =>
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

document.getElementById("sair-btn").addEventListener("click", function () {
    sessionStorage.clear();
    window.location.href = "http://127.0.0.1:5500/index.html";
});
