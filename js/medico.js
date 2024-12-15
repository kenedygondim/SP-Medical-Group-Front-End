document.addEventListener("DOMContentLoaded", fetchItems);
especialidades = [];

token = sessionStorage.getItem("token");
role = sessionStorage.getItem("role");

// Função para buscar dados da API
async function fetchItems() {
    const token = sessionStorage.getItem("token"); // Recupera o token salvo
    try {
        const response = await fetch('http://localhost:8080/api/Especialidade/ListarTodos');
        if (!response.ok) throw new Error("Erro ao carregar os dados.");

        items = await response.json(); // Assume que a resposta está no formato JSON

        // Dados simulados
        especialidades = items.map(item => item.nome);

        console.log(especialidades);

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

// Função para buscar sugestões
function buscarSugestoes() {
    const input = document.getElementById("pesquisa-input");
    const listaSugestoes = document.getElementById("sugestoes-list");
    const termo = input.value.toLowerCase();

    // Limpar sugestões anteriores
    listaSugestoes.innerHTML = "";

    if (termo) {
        const resultados = especialidades.filter(especialidade =>
            especialidade.toLowerCase().includes(termo)
        );

        // Mostrar sugestões
        if (resultados.length > 0) {
            listaSugestoes.style.display = "block";
            resultados.forEach(resultado => {
                const item = document.createElement("li");
                item.textContent = resultado;
                item.onclick = () => selecionarSugestao(resultado);
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





document.getElementById("sair-btn").addEventListener("click", function() {
    sessionStorage.clear();
    window.location.href = "http://127.0.0.1:5500/index.html";
});

