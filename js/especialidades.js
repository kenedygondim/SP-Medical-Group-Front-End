// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");

// Variáveis globais
let items = [];

// Evento de inicialização
document.addEventListener("DOMContentLoaded", async () => {
    await getEspecialidades();
    mostrarProfissionais();
    loadingScreen.style.display = "none";
});

//Função para buscar especialidades
async function getEspecialidades() {
    try {
        const response = await fetch(`http://localhost:8080/paginaEspecialidades`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        items = await response.json();
    } catch (error) {
        console.error(error)
        alert("Servidor não está respondendo. Tente novamente mais tarde!")
        window.location.href = "../../index.html"
    }
}

//Função para mostrar especialidades
function mostrarProfissionais() {
    const especialidades = document.getElementById("section-id");
    items.forEach(esp => {        
        especialidades.innerHTML += 
        `<div class="div-card" data-nome-especialidade="${esp.especialidade}" onclick="window.location.href = 'http://127.0.0.1:5500/html/profissionais.html?especialidade=${esp.especialidade}'">
            <h3 class="nome-especialidade">${esp.especialidade}</h3>
            <p class="descricao-especialidade">${esp.descricao}</p>
            <div class="additional-information">
                <p>${esp.numeroMedicos} médico(s) disponível(is)</p>
                <p>A partir de R$${esp.precoMinimo.toFixed(2)}</p>
            </div>
        </div>`;
    });
}

