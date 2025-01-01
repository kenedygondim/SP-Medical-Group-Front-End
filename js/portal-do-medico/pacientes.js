const params = new URLSearchParams(window.location.search);

const especialidade = params.get('especialidade');
const nomeDoMedico = params.get('paciente');
const numCrm = params.get('Data de atendimento');

const form = document.getElementById("section-filtros");
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    createProfilePictureActions();
    carregarEspecialidadeMedicoCrm();
    // mostrarProfissionais();
} );

async function fetchItems() {
    await getInfoBasicasUsuario();
    // await getInformacoesBasicasMedico();
    await getEspecialidadesMedico();
}

async function getInfoBasicasUsuario() {
    const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Medico/InfoBasicasUsuario?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(InfoBasicasUsuario.status !== 200) {
        const errorMessage = await InfoBasicasUsuario.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();

    console.log(InfoBasicasUsuarioJson);
}

function createProfilePictureActions() {
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
        window.location.href = "./meu-perfil.html";
    });

    document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
}



// async function getInformacoesBasicasMedico() {
//     try {
//         const url = "http://localhost:8080/api/Medico/ListarInformacoesBasicasMedico";
//         const informacoesBasicasMedico = await fetch(
//             `${url}?${especialidade == null ? "" : `especialidade=${especialidade}&`}${nomeDoMedico == null ? "" : `nomeMedico=${nomeDoMedico}&`}${numCrm == null ? "" : `numCrm=${numCrm}&`}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         informacoesBasicasMedicoJson = await informacoesBasicasMedico.json();
//     } catch (error) {
//         console.error("Erro ao buscar profissionais:", error);
//     }
// }

// async function getEspecialidades () {
//     try {
//         const especialidades = await fetch("http://localhost:8080/api/Especialidade/ListarTodos", {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         especialidadesJson = await especialidades.json();
//     } catch (error) {
//         console.error("Erro ao buscar especialidades:", error);
//     }
// }


// function mostrarProfissionais() {
//     const numeroProfissionais = document.getElementById("profissionais-encontrados-ou-nao");
//     if (especialidade !== null) 
//          informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum paciente encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} paciente(s) de ${especialidade.toLowerCase()}.`;
//     else 
//         informacoesBasicasMedicoJson.length === 0 ? numeroProfissionais.textContent = `Nenhum paciente encontrado` : numeroProfissionais.textContent = `Encontramos ${informacoesBasicasMedicoJson.length} paciente(s).`;
//     construirElementoMedico();
// }

function construirElementoMedico() {
    const perfis = document.getElementById("profissionais-encontrados");

    informacoesBasicasMedicoJson.forEach(profissional => {
        // Criando elementos
        const left = document.createElement("div");
        const right = document.createElement("div");
        const perfil = document.createElement("div");
        const foto = document.createElement("img");
        const nomeUsuario = document.createElement("h3");
        const agrupaParagrafo = document.createElement("div");
        const especialidade = document.createElement("p");
        const crm = document.createElement("p");
        const empresa = document.createElement("p");

        // Adicionando classes
        left.className = "left";
        right.className = "right";
        perfil.className = "perfil";
        foto.className = "foto";
        agrupaParagrafo.className = "agrupa-paragrafo";

        // Adicionando conteúdo
        foto.src = profissional.fotoPerfilUrl;
        nomeUsuario.textContent = profissional.nomeCompleto;
        especialidade.textContent = profissional.nomeTipoMedico;
        crm.textContent = profissional.crm;
        empresa.textContent = profissional.nomeFantasia;

        // Adicionando atributos
        perfil.setAttribute('medico-identificador', profissional.cpf);

        // Adicionando elementos ao HTML
        perfil.appendChild(left);
        perfil.appendChild(right);
        left.appendChild(foto);
        right.appendChild(nomeUsuario);
        right.appendChild(agrupaParagrafo);
        agrupaParagrafo.appendChild(especialidade);
        agrupaParagrafo.appendChild(crm);
        agrupaParagrafo.appendChild(empresa);
        perfis.appendChild(perfil);
        
        // Eventos
        perfil.addEventListener('click', function() {
            const medicoIdentificador = this.getAttribute('medico-identificador');
            showPopup(medicoIdentificador);
        });
    });
}
    

async function showPopup(medicoIdentificador) {
    const medico = await getInformacoesMedicoEspecifico(medicoIdentificador);
    const especialidades = await getEspecialidadesMedico(medicoIdentificador);

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
    especialidadess.textContent = `Especialidades: ${especialidades.map(especialidade => especialidade.nome).join(", ")}`;

    // Exibir o pop-up
    popupOverlay.style.display = "flex";
    popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent); 
}

async function getInformacoesMedicoEspecifico(medicoIdentificador) {
    try {
        const medico = await fetch(`http://localhost:8080/api/Medico/InformacoesMedicoEspecifico?cpfMedico=${medicoIdentificador}`, {
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

async function getEspecialidadesMedico() {
    try {
        const especialidades = await fetch(`http://localhost:8080/api/Especialidade/obterEspecialidadesMedico?cpf=${InfoBasicasUsuarioJson.cpf}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        especaliadadesJson = await especialidades.json();
    }
    catch (error) {
        console.error("Erro ao buscar especialidades do médico:", error);
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

    especaliadadesJson.forEach(especialidade => {
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


form.addEventListener("submit", function (event) {
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

