// Referência a elementos HTML
const loadingScreen = document.getElementById("loading-screen");

// Recuperação de parâmetros da URL
const params = new URLSearchParams(window.location.search);
const especialidade = params.get('especialidade');
const nomeDoMedico = params.get('medico');
const numCrm = params.get('crm');

// Variáveis globais
let informacoesBasicasMedicoJson = [];
let especialidadesJson = [];

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    carregarEspecialidadeMedicoCrm();
    mostrarProfissionais();
    loadingScreen.style.display = "none";
} );

async function fetchItems() {
    await getInformacoesBasicasMedico();
    await getEspecialidades();
}

async function getInformacoesBasicasMedico() {
    try {
        const url = `${apiPrefix}Medico/ListarInformacoesBasicasMedico`;

        const informacoesBasicasMedico = await fetch(
            `${url}?${especialidade == null ? "" : `especialidade=${especialidade}&`}${nomeDoMedico == null ? "" : `nomeMedico=${nomeDoMedico}&`}${numCrm == null ? "" : `numCrm=${numCrm}&`}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        informacoesBasicasMedicoJson = await informacoesBasicasMedico.json();
    } catch (error) {
        console.error(error)
        alert("Servidor não está respondendo. Tente novamente mais tarde!")
        window.location.href = "../../index.html"
    }
}

async function getEspecialidades () {
    try {
        const especialidades = await fetch(`${apiPrefix}Especialidade/ListarTodos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        especialidadesJson = await especialidades.json();
    } catch (error) {
        console.error("Erro ao buscar especialidades:", error);
    }
}


function mostrarProfissionais() {
    const numeroProfissionais = document.getElementById("profissionais-encontrados-ou-nao");

    if (especialidade !== null) 
         informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum profissional encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} profissional(is) de ${especialidade.toLowerCase()}.`;
    else 
        informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum profissional encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} profissional(is).`;
    construirElementoMedico();
}

function construirElementoMedico() {
    const perfis = document.getElementById("profissionais-encontrados");

    informacoesBasicasMedicoJson.forEach(profissional => {
        perfis.innerHTML += `
        <div class="perfil" medico-identificador="${profissional.cpf}" onclick="showPopup('${profissional.cpf}')">
            <div class="left">
                <img class="foto" src="${profissional.fotoPerfilUrl}" alt="Foto de ${profissional.nomeCompleto}">
            </div>
            <div class="right">
                <h3>${profissional.nomeCompleto}</h3>
                <div class="agrupa-paragrafo">
                    <p>${profissional.crm}</p>
                    <p>${profissional.nomeFantasia}</p>
                </div>
            </div>
        </div>`;
    });
}

async function getInformacoesMedicoEspecifico(medicoIdentificador) {
    try {
        const medico = await fetch(`${apiPrefix}Medico/InformacoesMedicoEspecifico?cpfMedico=${medicoIdentificador}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await medico.json();
    }
    catch (error) {
        console.error("Erro ao buscar informações do médico:", error);
    }
}

async function getEspecialidadesMedico(medicoIdentificador) {
    try {
        const especialidades = await fetch(`${apiPrefix}Especialidade/obterEspecialidadesMedico?cpf=${medicoIdentificador}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return await especialidades.json();
    }
    catch (error) {
        console.error("Erro ao buscar especialidades do médico:", error);
    }
}

async function showPopup(medicoIdentificador) {
    const medico = await getInformacoesMedicoEspecifico(medicoIdentificador);
    const especialidades = await getEspecialidadesMedico(medicoIdentificador);

    // Referência a elementos HTML
    const fotoPerfil = document.getElementById("fotoPerfil");
    const nomeMedico = document.getElementById("nomeMedico");
    const dataNascimento = document.getElementById("span-data-nascimento");
    const numeroConsultas = document.getElementById("span-num-consultas");
    const crm = document.getElementById("span-crm");
    const contato = document.getElementById("span-contato");
    const hospital = document.getElementById("span-hospital");
    const especialidadess = document.getElementById("span-especialidades");

    // Preenchendo as informações no pop-up
    fotoPerfil.src = medico.fotoPerfilUrl;
    nomeMedico.textContent = medico.nomeCompleto;
    dataNascimento.textContent = `${calcularIdade(medico.dataNascimento)}`;
    numeroConsultas.textContent = `${medico.numeroConsultas}`;
    crm.textContent = `${medico.crm}`;
    contato.textContent = `${medico.email}`;
    hospital.textContent = `${medico.nomeFantasia}`;
    especialidadess.textContent = `${especialidades.map(especialidade => especialidade.nome).join(", ")}`;

    // Exibir o pop-up
    popupOverlay.style.display = "flex";
    popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent); 
}


// Evento para fechar o pop-up
document.getElementById('closePopup').addEventListener("click", () => {
    popupOverlay.style.display = "none";
});

// Redirecionar para agendar consulta
document.getElementById('agendarConsulta').addEventListener("click", async () => {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${apiPrefix}Consulta/Acessar`, {
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

    especialidadesJson.forEach(especialidade => {
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

// Evento de clique para filtrar profissionais de acordo com a busca do usuário
document.getElementById("section-filtros").addEventListener("submit", function (event) {
    event.preventDefault();

    const especialidade = document.getElementById('especialidade-select').value;
    const medico = document.getElementById('nome-medico-input').value;
    const crm = document.getElementById('numero-crm-input').value;

    const params = {
        ...( especialidade != "0" && { especialidade }),
        ...( medico && { medico }),
        ...( crm && { crm })
    }

    const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`) // Substitui null/undefined por string vazia
    .join('&')

     window.location.href = `profissionais.html?${queryString}`
});

// Função para retornar idade do usuário com base na data de nascimento. 
// Exemplo de entrada: "2004-07-07"
// Exemplo de saída: "20 anos e 7 meses"
function calcularIdade(dataNascimento) {
    let nascimento = new Date(dataNascimento);
    let hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0) {
        anos--; 
        meses += 12;
    }

    return `${anos} anos e ${meses} meses`;
}