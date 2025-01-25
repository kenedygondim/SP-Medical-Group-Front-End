// Referência a elementos do HTML
const loadingScreen = document.getElementById("loading-screen");
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const fotoPerfilOptions = document.getElementById("foto-perfil-options")

const fotoPerfil = document.getElementById("fotoPerfil");
const nomePaciente = document.getElementById("nomeMedico");
const dataConsulta = document.getElementById("dataConsulta");
const horario = document.getElementById("horario");
const preco = document.getElementById("preco");
const endereco = document.getElementById("endereco");
const especialidade = document.getElementById("especialidade");

const itemsPerPageValueHtml = document.getElementById("items-per-page");
const sortByValueHtml = document.getElementById("sort-by");
const campoPesquisa = document.getElementById("campoPesquisa");

// Recuperação de dados de sessão
const email = sessionStorage.getItem("email");
const token = sessionStorage.getItem("token");

// Variáveis globais
let InfoBasicasUsuarioJson = {};
let itemsPerPage = 10; 
let ordenacaoDefault = "date"; 
let currentPage = 1; 
let consultasMedicoJson = [];

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Evento de carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    createProfilePictureActions();
    switch (ordenacaoDefault) {
        case "date":
            consultasMedicoJson = ordenarPorData();
            break;
        case "name":
            consultasMedicoJson = ordenarPorNome();
            break;
        case "price":
            consultasMedicoJson = ordenarPorValor();
            break;
    }
    renderPage(currentPage, itemsPerPage); 
    loadingScreen.style.display = "none";
});

async function fetchItems() {
    await getInfoBasicasUsuario();
    await getConsultasPaciente();
}

// Função que busca informações básicas do usuário logado no sistema como Foto de perfil, nome completo e CPF
async function getInfoBasicasUsuario() {
    const InfoBasicasUsuario = await fetch(`${apiPrefix}Medico/GetInfoBasicasUsuarioMedico?email=${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}
    });

    if(InfoBasicasUsuario.status !== 200) {
        const errorMessage = await InfoBasicasUsuario.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
}

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "../../index.html"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

async function getConsultasPaciente() {
    const consultasPaciente = await fetch(`${apiPrefix}Consulta/GetAllConsultasMedico?email=${email}`, {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    if(consultasPaciente.status !== 200) {
        const errorMessage = await consultasPaciente.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    consultasMedicoJson = await consultasPaciente.json();

    console.log(consultasMedicoJson);
}


// Função para renderizar a página atual
function renderPage(page,  itemsPerPageValue, itemsToRender = consultasMedicoJson) {

    const start = (page - 1) * itemsPerPageValue;
    const end = start + itemsPerPageValue;

    const paginatedItems =  itemsToRender.slice(start, end);
    
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = ""; 

    paginatedItems.forEach(item => {
        const row = document.createElement("tr");
                
        const date = new Date(item.dataConsulta);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit'};

        const dataConsulta = date.toLocaleDateString('pt-BR', options); 
        const precoConsulta = item.preco;   
        const horaConsulta = `${item.horaInicio} - ${item.horaFim}`;
        const nomePaciente = item.nomePaciente.length > 25 ? item.nomePaciente.substring(0, 25) + "..." : item.nomePaciente;

        row.innerHTML = `
            <td>${dataConsulta}</td>
            <td>R$ ${precoConsulta}</td>
            <td>${horaConsulta}</td>
            <td>${nomePaciente}</td>
            <td>${item.situacao}</td>
            <td> 
                <div>
                    <svg onclick="showPopup(${item.consultaId})" fill="#0b1c51" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 442.04 442.04" xml:space="preserve" stroke="#0b1c51"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M221.02,341.304c-49.708,0-103.206-19.44-154.71-56.22C27.808,257.59,4.044,230.351,3.051,229.203 c-4.068-4.697-4.068-11.669,0-16.367c0.993-1.146,24.756-28.387,63.259-55.881c51.505-36.777,105.003-56.219,154.71-56.219 c49.708,0,103.207,19.441,154.71,56.219c38.502,27.494,62.266,54.734,63.259,55.881c4.068,4.697,4.068,11.669,0,16.367 c-0.993,1.146-24.756,28.387-63.259,55.881C324.227,321.863,270.729,341.304,221.02,341.304z M29.638,221.021 c9.61,9.799,27.747,27.03,51.694,44.071c32.83,23.361,83.714,51.212,139.688,51.212s106.859-27.851,139.688-51.212 c23.944-17.038,42.082-34.271,51.694-44.071c-9.609-9.799-27.747-27.03-51.694-44.071 c-32.829-23.362-83.714-51.212-139.688-51.212s-106.858,27.85-139.688,51.212C57.388,193.988,39.25,211.219,29.638,221.021z"></path> </g> <g> <path d="M221.02,298.521c-42.734,0-77.5-34.767-77.5-77.5c0-42.733,34.766-77.5,77.5-77.5c18.794,0,36.924,6.814,51.048,19.188 c5.193,4.549,5.715,12.446,1.166,17.639c-4.549,5.193-12.447,5.714-17.639,1.166c-9.564-8.379-21.844-12.993-34.576-12.993 c-28.949,0-52.5,23.552-52.5,52.5s23.551,52.5,52.5,52.5c28.95,0,52.5-23.552,52.5-52.5c0-6.903,5.597-12.5,12.5-12.5 s12.5,5.597,12.5,12.5C298.521,263.754,263.754,298.521,221.02,298.521z"></path> </g> <g> <path d="M221.02,246.021c-13.785,0-25-11.215-25-25s11.215-25,25-25c13.786,0,25,11.215,25,25S234.806,246.021,221.02,246.021z"></path> </g> </g> </g></svg>
                    ${item.situacao != "Concluída" ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#614700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#614700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>` : ""}
                    ${item.situacao != "Concluída" ? `<svg onclick="cancelarConsulta(${item.consultaId})" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128z m0 85.333333c66.133333 0 128 23.466667 179.2 59.733334L273.066667 691.2C236.8 640 213.333333 578.133333 213.333333 512c0-164.266667 134.4-298.666667 298.666667-298.666667z m0 597.333334c-66.133333 0-128-23.466667-179.2-59.733334l418.133333-418.133333C787.2 384 810.666667 445.866667 810.666667 512c0 164.266667-134.4 298.666667-298.666667 298.666667z" fill="#750000"></path></g></svg>` : ""}     
                    ${item.situacao != "Concluída" ? `<svg onclick="marcarConsultaComoConcluida(${item.consultaId})" viewBox="0 -1.5 11 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>done_mini [#1484]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-304.000000, -366.000000)" fill="#387000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <polygon id="done_mini-[#1484]" points="259 207.6 252.2317 214 252.2306 213.999 252.2306 214 248 210 249.6918 208.4 252.2306 210.8 257.3082 206"> </polygon> </g> </g> </g> </g></svg>` : ""} 
                </div> 
            </td>
        `;
        

        tbody.appendChild(row);
    });

    // Atualizar informações de página e controle dos botões
    document.getElementById("page-info").textContent = `Página ${page}`;
    document.getElementById("prev").disabled = page === 1 ? true : false;
    document.getElementById("next").disabled = end >= consultasMedicoJson.length;
}

// Funções para mudar a página
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage, itemsPerPage);
    }
}

function nextPage() {
    if ((currentPage * itemsPerPage) < consultasMedicoJson.length) {
        currentPage++;
        renderPage(currentPage, itemsPerPage);
    }
}



function searchItems(event) {
    const searchValue = event.target.value.toLowerCase();

    const filteredItems = searchValue
    ? consultasMedicoJson.filter(item => item.nomePaciente.toLowerCase().includes(searchValue))
    : consultasMedicoJson;

    renderPage(1, itemsPerPage, filteredItems);
}


campoPesquisa.addEventListener("input", searchItems);





function changeItemsPerPage(event) {
    itemsPerPage = parseInt(event.target.value);
    renderPage(1, itemsPerPage);
}

function changeSortBy(event) {
    ordenacao = event.target.value;

    switch (ordenacao) {
        case "date":
            consultasMedicoJson = ordenarPorData();
            break;
        case "name":
            consultasMedicoJson = ordenarPorNome();
            break;
        case "price":
            consultasMedicoJson = ordenarPorValor();
            break;
    }


    console.log("ordenacao: " + ordenacao);
    console.table(consultasMedicoJson);

    renderPage(1, itemsPerPage);
}

itemsPerPageValueHtml.addEventListener("change", changeItemsPerPage);
sortByValueHtml.addEventListener("change", changeSortBy);

function ordenarPorData () {
     return consultasMedicoJson.sort((a, b) => {
        // Converter as datas para objetos Date para comparação
        const dataA = new Date(a.dataConsulta);
        const dataB = new Date(b.dataConsulta);
    
        // Retornar um número negativo se a < b, positivo se a > b e zero se a === b
        return dataB - dataA;
    });
}

function ordenarPorNome () {
    return consultasMedicoJson.sort((a, b) => {
        // Comparar as propriedades 'nome' dos objetos
        return a.nomePaciente.localeCompare(b.nomePaciente);
      });
}

function ordenarPorValor () {
    return consultasMedicoJson.sort((a, b) => {
        // Comparar as propriedades 'nome' dos objetos
        return (a.preco) - (b.preco);
      });
}

// Função para mostrar o pop-up
async function showPopup(consultaIdentificador) {
    try {
      const consulta = consultasMedicoJson.find(consulta => consulta.consultaId == consultaIdentificador);

      fotoPerfil.src = consulta.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/../../assets/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp.webp" : consulta.fotoPerfilUrl;
      nomePaciente.textContent = consulta.nomePaciente
      dataConsulta.textContent = `${consulta.dataConsulta}`;
      horario.textContent = `${consulta.horaInicio} - ${consulta.horaFim}`;
      especialidade.textContent = `${consulta.especialidade}`;
      motivo.textContent = `${consulta.descricao}`;
      preco.textContent = `R$ ${consulta.preco}`;

      !consulta.isTelemedicina ? endereco.textContent = `${consulta.logradouro}, ${consulta.numero} - ${consulta.bairro} - ${consulta.municipio} - ${consulta.uf}, ${consulta.cep}` : endereco.textContent = `Consulta Online via Google Meet`;
      
      if (consulta.situacao == "Concluída") {
        document.getElementById("actions").style.display = "none";
        document.getElementById("div-consulta-concluida").style.display = "flex";
      }
      else {
        document.getElementById("actions").style.display = "flex";
        document.getElementById("div-consulta-concluida").style.display = "none";
      }

      popupOverlay.style.display = "flex";
      popupOverlay.setAttribute('medico-identificador', nomeMedico.textContent);
      document.getElementById("cancelar-consulta").addEventListener("click", async () => { await cancelarConsulta(consultaIdentificador) });


      document.getElementById("marcar-concluida").addEventListener("click", async () => { await marcarConsultaComoConcluida(consultaIdentificador) });
    }
    catch (error) {
      console.error(error.message);
    }
}

// Evento para fechar o pop-up
closePopupBtn.addEventListener("click", closePopup);

function closePopup() {
    popupOverlay.style.display = "none";
}

// Função para cancelar a consulta
async function cancelarConsulta (consultaIdentificador) {

    const confirmation = window.confirm("Tem certeza que deseja cancelar essa consulta?")

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`${apiPrefix}Consulta/CancelarConsulta?consultaId=${consultaIdentificador}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        response.status == 204 ? alert("Consulta cancelada com sucesso.") : alert("Não foi possível cancelar a consulta.");
        fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}

// Função para marcar a consulta como concluída
async function marcarConsultaComoConcluida (consultaIdentificador) {

    const confirmation = window.confirm("Tem certeza que deseja marcar essa consulta como concluída?")

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(`${apiPrefix}Consulta/MarcarConsultaComoConcluida?consultaId=${consultaIdentificador}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        response.status == 204 ? alert("Consulta marcada como concluída com sucesso.") : alert("Não foi possível marcar a consulta como concluída.");
        await fetchItems();
    } catch (error) {
        console.error(error.message);
        alert("Não foi possível processar a solicitação.");
    } finally {
        closePopup();
        location.reload();
    }
}