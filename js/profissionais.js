document.addEventListener("DOMContentLoaded", fetchItems);
profissionais = [];
const params = new URLSearchParams(window.location.search);
const especialidade = params.get('especialidade');
const nomeDoMedico = params.get('medico');
const numCrm = params.get('crm');

// Função para buscar dados da API
async function fetchItems() {
    try {
        const getProfissionais = await fetch("http://localhost:8080/api/Medico/ListarTodos"); //Lista todos os médicos com as informações básicas do card


        
        const getEspecialidades = await fetch("http://localhost:8080/api/Especialidade/ListarTodos") //Lista todas as especialidades

        console.log(getProfissionais);

        if (!getProfissionais.ok || !getEspecialidades) throw new Error("Erro ao carregar os dados.");

        items = await getProfissionais.json(); // Assume que a resposta está no formato JSON
        especialidades = await getEspecialidades.json();

        // Dados simulados

        if (especialidade !== null && nomeDoMedico === null && numCrm === null) { //apenas o o primeiro campo marcadao
            profissionais = items.filter(item => item.nome === especialidade);
        }
        else if (especialidade === null && nomeDoMedico !== null && numCrm === null) { //apenas o segundo campo marcado
            profissionais = items.filter(item => item.nomeCompleto.includes(nomeDoMedico));
        }
        else if (especialidade === null && nomeDoMedico === null && numCrm !== null) { //apenas o terceiro campo marcado
            profissionais = items.filter(item => item.crm === numCrm);
        }
        else if (especialidade !== null && nomeDoMedico !== null && numCrm === null) { //o primeiro e o segundo campo marcados
            profissionais = items.filter(item => item.nome === especialidade && item.nomeUsuario.includes(nomeDoMedico));
        }
        else if (especialidade !== null && nomeDoMedico === null && numCrm !== null) { //o primeiro e o terceiro campo marcados
            profissionais = items.filter(item => item.nome === especialidade && item.crm === numCrm);
        }
        else if (especialidade === null && nomeDoMedico !== null && numCrm !== null) { //o segundo e o terceiro campo marcados
            profissionais = items.filter(item => item.nomeCompleto.includes(nomeDoMedico) && item.crm === numCrm);
        }
        else if (especialidade !== null && nomeDoMedico !== null && numCrm !== null) { //todos os campos marcados
            profissionais = items.filter(item => item.nome === especialidade && item.nomeCompleto.includes(nomeDoMedico) && item.crm === numCrm);
        }
        else { //nenhum campo marcado
            profissionais = items;
        }


        console.log(profissionais);
        console.log(especialidades);

        mostrarProfissionais();
        carregarEspecialidadeMedicoCrm();

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

function mostrarProfissionais() {
    const numeroProfissionais = document.getElementById("profissionais-encontrados-ou-nao");

    if (especialidade !== null) {
        if (profissionais.length === 0) {
            numeroProfissionais.textContent = `Nenhum profissional encontrado`;
            return;
        }
        else if (profissionais.length === 1) {
            numeroProfissionais.textContent = `Encontramos 1 profissional de ${especialidade.toLowerCase()}`;
        } 
        else {
            numeroProfissionais.textContent = `Foram encontrados ${profissionais.length} profissionais de ${especialidade.toLowerCase()}.`;
        }
    }
    else {

        if (profissionais.length === 0) {
            numeroProfissionais.textContent = `Nenhum profissional encontrado`;
            return;
        }
        else if (profissionais.length === 1) {
            numeroProfissionais.textContent = `Encontramos 1 profissional.`;
        }
        else
            numeroProfissionais.textContent = `Encontramos ${profissionais.length} profissionais`;
    }
    
 
    const perfis = document.getElementById("profissionais-encontrados");

    apoio = 1;

    profissionais.forEach(profissional => {

        const left = document.createElement("div");
        left.className = "left";

        const right = document.createElement("div");
        right.className = "right";

        const perfil = document.createElement("div");
        perfil.className = "perfil";

        const foto = document.createElement("img");
        foto.src = `../assets/foto-medicos-teste/${apoio}.jpg`; //apenas teste
        foto.className = "foto";

        const nomeUsuario = document.createElement("h3");
        nomeUsuario.textContent = profissional.nomeCompleto;

        const agrupaParagrafo = document.createElement("div");
        agrupaParagrafo.className = "agrupa-paragrafo";

        const especialidade = document.createElement("p");
        especialidade.textContent = profissional.nomeTipoMedico;

        const crm = document.createElement("p");
        crm.textContent = profissional.crm;

        const empresa = document.createElement("p");
        empresa.textContent = profissional.nomeFantasia;

        perfil.appendChild(left);
        perfil.appendChild(right);

        left.appendChild(foto);

        right.appendChild(nomeUsuario);
        right.appendChild(agrupaParagrafo);


        agrupaParagrafo.appendChild(especialidade);
        agrupaParagrafo.appendChild(crm);
        agrupaParagrafo.appendChild(empresa);

        perfis.appendChild(perfil);

        apoio++
    });
}

function carregarEspecialidadeMedicoCrm() {
    const select = document.getElementById('especialidade-select');

    especialidades.forEach(especialidade => {
        const option = document.createElement('option');
        option.value = especialidade.nome;
        option.textContent = especialidade.nome;
        select.appendChild(option);
    });

    if (especialidade) {
        const optionToSelect = select.querySelector(`option[value="${especialidade}"]`);
        if (optionToSelect) {
            optionToSelect.selected = true;
        }
    }

    if (nomeDoMedico) {
        const inputa = document.getElementById('nome-medico-input');
        inputa.value = nomeDoMedico;
    }

    if (numCrm) {
        const inputg = document.getElementById('numero-crm-input');
        inputg.value = numCrm;
    }
}

const form = document.getElementById("section-filtros");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const select = document.getElementById('especialidade-select');
    const nomeMedicoInput = document.getElementById('nome-medico-input');
    const crmInput = document.getElementById('numero-crm-input');


    const especialidadeSelecionada = select.value;

    if (especialidadeSelecionada === "0" && nomeMedicoInput.value === "" && crmInput.value === "") // todos os campos vazios
        window.location.href = `especialidades.html`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value === "" && crmInput.value === "") // apenas o primeiro campo marcado
        window.location.href = `especialidades.html?especialidade=${especialidadeSelecionada}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value !== "" && crmInput.value === "") // apenas o segundo campo marcado
        window.location.href = `especialidades.html?medico=${nomeMedicoInput.value}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value === "" && crmInput.value !== "") // apenas o terceiro campo marcado
        window.location.href = `especialidades.html?crm=${crmInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value !== "" && crmInput.value === "") // o primeiro e o segundo campo marcados
        window.location.href = `especialidades.html?especialidade=${especialidadeSelecionada}&medico=${nomeMedicoInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value === "" && crmInput.value !== "") // o primeiro e o terceiro campo marcados
        window.location.href = `especialidades.html?especialidade=${especialidadeSelecionada}&crm=${crmInput.value}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value !== "" && crmInput.value !== "") // o segundo e o terceiro campo marcados
        window.location.href = `especialidades.html?medico=${nomeMedicoInput.value}&crm=${crmInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value !== "" && crmInput.value !== "") // todos os campos marcados
        window.location.href = `especialidades.html?especialidade=${especialidadeSelecionada}&medico=${nomeMedicoInput.value}&crm=${crmInput.value}`;
});