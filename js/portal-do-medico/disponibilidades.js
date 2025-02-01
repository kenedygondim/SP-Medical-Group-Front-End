// Referência a elementos HTML
const profileContainer = document.getElementById("profile-container");
const profileMenu = document.getElementById("profile-menu");
const logoutOption = document.getElementById("logout");
const viewProfileOption = document.getElementById("view-profile");
const loadingScreen = document.getElementById("loading-screen");
const fotoPerfilOptions = document.getElementById("foto-perfil-options");
const availabilityForm = document.getElementById('availabilityForm');
const dateInput = document.getElementById('date');
const availabilitiesList = document.getElementById('availabilitiesList');

// Recuperação de informações de sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

// Declaração de variáveis globais
let InfoBasicasUsuarioJson = {};

// Prefixo de chamada de API
const apiPrefix = "http://44.210.248.181:5001/api/";

// Evento de inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await getDadosBasicosUsuario();
    createProfilePictureActions();
    loadingScreen.style.display = "none";
});

// Função que busca as informações básicas do usuário (URL da foto de perfil, email, nome, CPF)
async function getDadosBasicosUsuario() {
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

// Função para buscar as disponibilidades existentes para uma data específica
async function getDisponibilidadesPorData(cpf, data) {
    try {
        const response = await fetch(`${apiPrefix}Disponibilidade/GetAllDisponibilidadesMedico?cpf=${cpf}&data=${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar disponibilidades: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar disponibilidades:', error);
        alert('Não foi possível buscar os horários. Tente novamente mais tarde.');
        return [];
    }
}

// Função para exibir as disponibilidades existentes
function exibirDisponibilidades(disponibilidades) {
    // Limpa a lista atual
    availabilitiesList.innerHTML = '';
    document.getElementById('h2-conflitos').textContent = '';

    document.getElementById('existingAvailabilities').style.display = 'block';
    
    if (disponibilidades.length === 0) {
        availabilitiesList.innerHTML = '<li>Nenhum possível conflito encontrado para esta data.</li>';
        return;
    }

    document.getElementById('h2-conflitos').textContent = 'Atenção! horários já preenchidos para o dia:';

    // Adiciona cada disponibilidade como um item da lista
    disponibilidades.forEach(({ horaInicio, horaFim }) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${horaInicio} - ${horaFim}`;
        availabilitiesList.appendChild(listItem);
    });
}

// Evento para detectar mudanças na data e buscar disponibilidades
dateInput.addEventListener('change', async () => {
    const data = dateInput.value;
    const cpf = InfoBasicasUsuarioJson.cpf; // Certifique-se de que o CPF esteja carregado

    setInterval(() => {}, 1000);

    if (!data || !cpf) {
        alert('Por favor, insira uma data válida');
        return;
    }

    // Mostra um indicador de carregamento (opcional)
    loadingScreen.style.display = 'flex';

    // Busca as disponibilidades
    const disponibilidades = await getDisponibilidadesPorData(cpf, data);

    // Exibe as disponibilidades
    exibirDisponibilidades(disponibilidades);

    // Oculta o indicador de carregamento
    loadingScreen.style.display = 'none';
});

// Função que cria as ações (Login e Ver Perfil) do botão que contém a foto de perfil do usuário logado  no header
function createProfilePictureActions() {
    fotoPerfilOptions.addEventListener("click", () => profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block" );
    logoutOption.addEventListener("click", () => { sessionStorage.clear(); window.location.href = "SP-Medical-Group-Front-End/"; });
    viewProfileOption.addEventListener("click", () =>  window.location.href = "./meu-perfil.html" );
    fotoPerfilOptions.src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : InfoBasicasUsuarioJson.fotoPerfilUrl;
    document.addEventListener("click", (event) => !profileContainer.contains(event.target) ? profileMenu.style.display = "none" : null);
}

// Evento de submissão do formulário de disponibilidade
availabilityForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    loadingScreen.style.display = "flex";

    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const body = {
        emailMedico: sessionStorage.getItem('email'),
        dataDisp: date,
        horaInicio: startTime,
        horaFim: endTime
    };

    await postDisponibilidade(body);

    loadingScreen.style.display = "none";
});

// Função que envia uma requisição POST para cadastrar uma disponibilidade
async function postDisponibilidade(body) {
    try {
        const response = await fetch(`${apiPrefix}Disponibilidade/AdicionarDisponibilidade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        // Processar a resposta do servidor
        const responseJson = await response.json();

        if (response.ok) {
            // Cadastro bem-sucedido
            alert('Disponibilidade cadastrada com sucesso!');
        } else if (response.status === 400) {
            // Erro de validação (exemplo: conflito de horários)
            if (responseJson.detalhes) {
                alert(`Erro: ${responseJson.detalhes}`);
            } else {
                alert(`Erro: ${responseJson.mensagem || 'Ocorreu um erro ao cadastrar a disponibilidade.'}`);
            }
        } else {
            // Outros erros (exemplo: erro no servidor)
            alert(`Erro inesperado: ${responseJson.mensagem || 'Algo deu errado.'}`);
        }
    } catch (error) {
        // Erros de rede ou outras exceções
        console.error('Erro na requisição:', error);
        alert('Falha ao comunicar com o servidor. Por favor, tente novamente mais tarde.');
    }
}

