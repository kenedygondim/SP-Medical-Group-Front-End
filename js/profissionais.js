document.addEventListener("DOMContentLoaded", fetchItems);
profissionais = [];
const params = new URLSearchParams(window.location.search);
const especialidade = params.get('especialidade');
const nomeDoMedico = params.get('medico');
const numCrm = params.get('crm');

// Função para buscar dados da API
async function fetchItems() {
    try {
        const url = "http://localhost:8080/api/Medico/ListarInformacoesBasicasMedico";

        const getProfissionais = await fetch(
            `${url}?${especialidade == null ? "" : `especialidade=${especialidade}&`}${nomeDoMedico == null ? "" : `nomeMedico=${nomeDoMedico}&`}${numCrm == null ? "" : `numCrm=${numCrm}&`}`, {
            method: 'GET', // Usar GET, pois os parâmetros estão na query string
            headers: {
                'Content-Type': 'application/json' // Ainda define o tipo de conteúdo, mas o corpo não é necessário
            }
        });

        const getEspecialidades = await fetch("http://localhost:8080/api/Especialidade/ListarTodos") //Lista todas as especialidades
        if (!getProfissionais.ok || !getEspecialidades) throw new Error("Erro ao carregar os dados.");

        profissionais = await getProfissionais.json(); // Assume que a resposta está no formato JSON
        especialidades = await getEspecialidades.json();

        carregarEspecialidadeMedicoCrm();
        mostrarProfissionais();

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
        else if (profissionais.length === 1) 
            numeroProfissionais.textContent = `Encontramos 1 profissional de ${especialidade.toLowerCase()}`;
        else 
            numeroProfissionais.textContent = `Foram encontrados ${profissionais.length} profissionais de ${especialidade.toLowerCase()}.`;
    }
    else {
        if (profissionais.length === 0) {
            numeroProfissionais.textContent = `Nenhum profissional encontrado`;
            return;
        }
        else if (profissionais.length === 1) 
            numeroProfissionais.textContent = `Encontramos 1 profissional.`;
        else
            numeroProfissionais.textContent = `Encontramos ${profissionais.length} profissionais`;
    }
    
 
    const perfis = document.getElementById("profissionais-encontrados");


    profissionais.forEach(profissional => {

        const left = document.createElement("div");
        left.className = "left";

        const right = document.createElement("div");
        right.className = "right";

        const perfil = document.createElement("div");
        perfil.className = "perfil";

        perfil.setAttribute('medico-identificador', profissional.cpf);

        const foto = document.createElement("img");

        foto.src = profissional.fotoPerfilUrl; //apenas teste
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
        
        perfil.style.cursor = 'pointer'

        perfil.addEventListener('click', function() {
            const medicoIdentificador = this.getAttribute('medico-identificador');
            showPopup(medicoIdentificador);
        });


    });
}




async function showPopup(medicoIdentificador) {
        const urlMedicos = `http://localhost:8080/api/Medico/InformacoesMedicoEspecifico?cpfMedico=${medicoIdentificador}`;
        const urlEspecialidades = `http://localhost:8080/api/Especialidade/obterEspecialidadesMedico?cpf=${medicoIdentificador}`;

        try {
          const responseMedicos = await fetch(urlMedicos);
          const responseEspecialidades = await fetch(urlEspecialidades);

          if (!responseMedicos.ok || !responseEspecialidades.ok) throw new Error("Erro ao buscar informações.");
          
          const medico = await responseMedicos.json();
          const especialidadesJson = await responseEspecialidades.json();

          const fotoPerfil = document.getElementById("fotoPerfil");
          const nomeMedico = document.getElementById("nomeMedico");
          const dataNascimento = document.getElementById("dataNascimento");
          const numeroConsultas = document.getElementById("numeroConsultas");
          const crm = document.getElementById("crm");
          const contato = document.getElementById("contato");
          const hospital = document.getElementById("hospital");
          const especialidadess = document.getElementById("especialidadess");

          // Preenchendo as informações no pop-up
          fotoPerfil.src = medico.fotoPerfilUrl;
          nomeMedico.textContent = medico.nomeCompleto;
          dataNascimento.textContent = `Data de Nascimento: ${medico.dataNascimento}`;
          numeroConsultas.textContent = `Número de Consultas realizadas: ${medico.numeroConsultas}`;
          crm.textContent = `CRM: ${medico.crm}`;
          contato.textContent = `Contato: ${medico.email}`;
          hospital.textContent = `Hospital: ${medico.nomeFantasia}`;
          especialidadess.textContent = `Especialidades: ${especialidadesJson.map(especialidade => especialidade.nome).join(", ")}`;

          // Exibir o pop-up
          popupOverlay.style.display = "flex";

          popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent);
        } catch (error) {
          console.error(error.message);
          alert("Não foi possível carregar as informações do médico.");
        }
}


// Evento para fechar o pop-up
closePopup.addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

// Redirecionar para agendar consulta
agendarConsulta.addEventListener("click", async () => {
    const token = sessionStorage.getItem("token");
    const response = await fetch("http://localhost:8080/api/Consulta/Acessar", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        } 
    });

    if(response.status != 200) 
        window.location.href = "http://127.0.0.1:5500/html/login.html"
    else 
        window.location.href = "http://127.0.0.1:5500/html/portal-do-paciente/agendar-consulta.html?medico=" + popupOverlay.getAttribute('medico-identificador');
});


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
        if (optionToSelect) 
            optionToSelect.selected = true;
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
        window.location.href = `profissionais.html`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value === "" && crmInput.value === "") // apenas o primeiro campo marcado
        window.location.href = `profissionais.html?especialidade=${especialidadeSelecionada}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value !== "" && crmInput.value === "") // apenas o segundo campo marcado
        window.location.href = `profissionais.html?medico=${nomeMedicoInput.value}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value === "" && crmInput.value !== "") // apenas o terceiro campo marcado
        window.location.href = `profissionais.html?crm=${crmInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value !== "" && crmInput.value === "") // o primeiro e o segundo campo marcados
        window.location.href = `profissionais.html?especialidade=${especialidadeSelecionada}&medico=${nomeMedicoInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value === "" && crmInput.value !== "") // o primeiro e o terceiro campo marcados
        window.location.href = `profissionais.html?especialidade=${especialidadeSelecionada}&crm=${crmInput.value}`;
    else if (especialidadeSelecionada === "0" && nomeMedicoInput.value !== "" && crmInput.value !== "") // o segundo e o terceiro campo marcados
        window.location.href = `profissionais.html?medico=${nomeMedicoInput.value}&crm=${crmInput.value}`;
    else if (especialidadeSelecionada !== "0" && nomeMedicoInput.value !== "" && crmInput.value !== "") // todos os campos marcados
        window.location.href = `profissionais.html?especialidade=${especialidadeSelecionada}&medico=${nomeMedicoInput.value}&crm=${crmInput.value}`;
});

