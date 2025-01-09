const loadingScreen = document.getElementById("loading-screen");

document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    loadingScreen.style.display = "none";
});

async function fetchItems() {
    try {
        const response = await fetch('http://localhost:8080/paginaEspecialidades', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const items = await response.json();
        mostrarProfissionais(items);
    } catch (error) {
        console.error(error)
        alert("Servidor não está respondendo. Tente novamente mais tarde!")
        window.location.href = "../../index.html"
    }
}

function mostrarProfissionais(items) {
    const especialidades = document.getElementById("section-id");
    items.forEach(esp => {        
        const divCard = document.createElement("div");
        divCard.className = "div-card";

        divCard.setAttribute('data-nome-especialidade', esp.especialidade);

        const nomeEspecialidade = document.createElement("h3");
        nomeEspecialidade.textContent = esp.especialidade;
        nomeEspecialidade.className = "nome-especialidade";

        const descricaoEspecialidade = document.createElement("p");
        descricaoEspecialidade.textContent = esp.descricao;
        descricaoEspecialidade.className = "descricao-especialidade";

        const additionalInformation = document.createElement("div");
        additionalInformation.className = "additional-information";
    
        const numProfissionais = document.createElement("p");
        numProfissionais.textContent = esp.numeroMedicos + " médico(s) disponível(is)";

        const minPreco = document.createElement("p");
        minPreco.textContent = "A partir de R$" + esp.precoMinimo.toFixed(2);


        additionalInformation.appendChild(numProfissionais);
        additionalInformation.appendChild(minPreco);

        divCard.appendChild(nomeEspecialidade);
        divCard.appendChild(descricaoEspecialidade);
        divCard.appendChild(additionalInformation);

        divCard.addEventListener('click', function() {
            const especialidade = this.getAttribute('data-nome-especialidade');
            window.location.href = `http://127.0.0.1:5500/html/profissionais.html?especialidade=${especialidade}`;
        });
        especialidades.appendChild(divCard);
    });
}

