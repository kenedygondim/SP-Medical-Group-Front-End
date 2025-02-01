const formSelecao = document.getElementById('form-selecao');
const resumoConsultaDiv = document.getElementById('resumo-consulta');
const especialidadeSelect = document.getElementById('especialidade');
const dataInput = document.getElementById('data');
const horarioSelect = document.getElementById('horario');
const medicoSelect = document.getElementById('medico');
const resumoConsulta = document.getElementById('resumo-consulta');
const descricaoInput = document.getElementById('descricao');
const isConsultaOnline = document.getElementById('online');
const loadingScreen = document.getElementById("loading-screen");

const urlParams = new URLSearchParams(window.location.search);
const medicoQuery = urlParams.get('medico');
const especialidadeQuery = urlParams.get('especialidade');

const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");

let InfoBasicasUsuario = {};
let medicos = [];

const hoje = new Date();
dataInput.min = retornaDataFormatada(hoje);

// Prefixo de chamada de API
const apiPrefix = "https://44.210.248.181:5001/api/";

document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();
    carregarFotoPerfilOptions();
    carregarMedicosOptions();
    loadingScreen.style.display = "none";
});

async function fetchItems() {
    await Acessar();
    await GetInfoBasicasUsuario();
    await ListarTodosMedicos();
}

async function Acessar() {
  try {
    const acesso = await fetch(`${apiPrefix}Consulta/Acessar`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
    }});
    
    if (acesso.status == 401) window.location.href = "https://kenedygondim.github.io/SP-Medical-Group-Front-End/html/login.html"

  } catch (error) {
      console.error(error)
      alert("Servidor não está respondendo. Tente novamente mais tarde!")
      window.location.href = "https://kenedygondim.github.io/SP-Medical-Group-Front-End/"
  }
}

async function ListarTodosMedicos() {
  try {
    const response = await fetch(`${apiPrefix}Medico/GetAllMedicos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    medicos = await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function GetInfoBasicasUsuario() {
  try {
    const response = await fetch(`${apiPrefix}Paciente/GetInfoBasicasUsuarioPaciente?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    InfoBasicasUsuario = await response.json();
  } catch (error) {
    console.log(error);
  }
}

function carregarFotoPerfilOptions() {
  const profileContainer = document.getElementById("profile-container");
  const profileMenu = document.getElementById("profile-menu");
  const logoutOption = document.getElementById("logout");
  const viewProfileOption = document.getElementById("view-profile");
  const fotoPerfilOptions = document.getElementById("foto-perfil-options");

  fotoPerfilOptions.src = InfoBasicasUsuario.fotoPerfilUrl == "" ? "https://sp-medical-group.s3.us-east-1.amazonaws.com/SP-MEDICAL-GROUP-USER-PROFILE-PICTURE-DEFAULT" : InfoBasicasUsuario.fotoPerfilUrl;
  fotoPerfilOptions.addEventListener("click", () => {
      profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
      if (!profileContainer.contains(event.target)) {
          profileMenu.style.display = "none";
      }
  });

  logoutOption.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "https://kenedygondim.github.io/SP-Medical-Group-Front-End/";
  });

  viewProfileOption.addEventListener("click", () => {
      window.location.href = "./meu-perfil.html";
  });
}

function carregarMedicosOptions() {
  medicoSelect.innerHTML = '<option value="">Selecione um médico</option>';
  medicos.forEach(medico => {
    const option = document.createElement('option');
    option.value = medico.cpf;
    option.textContent = medico.nomeCompleto;
    medicoSelect.appendChild(option);

    if (medicoQuery && medico.nomeCompleto === medicoQuery) {
      option.selected = true;
      carregarEspecialidades(medico.cpf);
    }
})
};

document.getElementById('avancar').addEventListener('click', () => {
  if(!especialidadeSelect.value || !medicoSelect.value || !dataInput.value || !horarioSelect.value){
    alert("Insira todos os campos!");
    return;
  }
  const cpf = medicoSelect.value;
  if (cpf) {
    carregarResumo(cpf);
    formSelecao.classList.remove('form-active');
    resumoConsultaDiv.classList.add('form-active');
  }
});

document.getElementById('voltar').addEventListener('click', () => {
  resumoConsultaDiv.classList.remove('form-active');
  formSelecao.classList.add('form-active');
});

medicoSelect.addEventListener('change', () => {
  const cpf = medicoSelect.value;
  if (cpf) 
    carregarEspecialidades(cpf);
  else 
    especialidadeSelect.innerHTML = '<option value="">Selecione um médico primeiro</option>';
});

async function carregarEspecialidades(cpf) {
  dataInput.value = '';

  const response = await fetch(`${apiPrefix}Especialidade/GetAllEspecialidadesMedico?cpf=${cpf}`);
  const especialidades = await response.json();

  especialidadeSelect.innerHTML = '<option value="">Selecione uma especialidade</option>';
  especialidades.forEach(esp => {
    const option = document.createElement('option');
    option.id = esp.especialidadeId
    option.value = esp.nome;
    option.textContent = esp.nome;
    especialidadeSelect.appendChild(option);
  });

  if (especialidadeQuery && especialidades.some(esp => esp.nome === especialidadeQuery)) {
    especialidadeSelect.value = especialidadeQuery;
  }
}

async function carregarDisponibilidades(cpf, data) {
  const response = await fetch(`${apiPrefix}Disponibilidade/GetDisponibilidadesMedicoNaoPreenchidas?cpf=${cpf}&data=${data}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
  }});
  
  const  disponibilidades = await response.json();
  let disponibilidadesFiltradas;
  
  if (data == retornaDataFormatada(new Date())) {
     disponibilidadesFiltradas = retornaDisponibiliadesMaioresQueHoraAtual(disponibilidades);
  } 
  else if (data < retornaDataFormatada(new Date())) {
    disponibilidadesFiltradas = [];
  }
  else {
    disponibilidadesFiltradas = disponibilidades;
  }

  
  if(disponibilidadesFiltradas.length == 0){
      horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
      return;
  }

  horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
  disponibilidadesFiltradas.forEach(disponibilidade => {
    const option = document.createElement('option');
    option.id = disponibilidade.disponibilidadeId
    option.value = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    option.textContent = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    horarioSelect.appendChild(option);
  });
}

async function carregarResumo(cpf) {
  const token = sessionStorage.getItem("token")

  const response = await fetch(`${apiPrefix}Consulta/GetDetalhesConsulta?cpf=${cpf}&nomeEspecialidade=${especialidadeSelect.value}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    } 
  })

  if (response.status == 200) {
    const details = await response.json();
    document.getElementById('span-medico-consulta').textContent = `${medicoSelect.options[medicoSelect.selectedIndex].text}`;
    document.getElementById('span-especialidade-consulta').textContent = `${especialidadeSelect.value}`;
    document.getElementById('span-data-consulta').textContent = `${formatarData(dataInput.value)}`;
    document.getElementById('span-horario-consulta').textContent = `${horarioSelect.value}`;
    document.getElementById('span-valor-consulta').textContent = `R$ ${details.valorConsulta.toFixed(2)}`;

    const enderecoConsulta = document.getElementById('span-endereco-consulta');

    enderecoConsulta.textContent = isConsultaOnline.options[isConsultaOnline.selectedIndex].value == 1 ? "Consulta online via Google Meet" : `Endereço da Consulta: ${details.logradouro}, ${details.numero} ${details.complemento} - ${details.bairro}, ${details.municipio}, SP`;

    if (isConsultaOnline.options[isConsultaOnline.selectedIndex].value == 0) {
      document.getElementById('div-iframe').innerHTML = 
      `<iframe
              width="600"
              height="450"
              style="border:0"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCGdEV7nhmEXtzTSxRIvjBWusjjAsMzYzc&q=${formatAddress(enderecoConsulta.textContent)}">  
              <!-- TODO: pegar dinamicamente o endereço da consulta/Remover Iframe em caso de consulta online -->
          </iframe>`;
    }
    else {
      document.getElementById('div-iframe').innerHTML = "";
    }
  }
  else {
      window.location.href = "https://kenedygondim.github.io/SP-Medical-Group-Front-End/html/login.html"
  }
}

dataInput.addEventListener('change', () => {
  const cpf = medicoSelect.value;
  const data = dataInput.value;

  if (cpf && data) {
    carregarDisponibilidades(cpf, data);
  } else {
    horarioSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
  }
});

resumoConsulta.addEventListener('submit', async (event) => {
  event.preventDefault()
  const token = sessionStorage.getItem("token")

  const data = {
    disponibilidadeId: parseInt(horarioSelect.options[horarioSelect.selectedIndex].id),
    especialidadeId: parseInt(especialidadeSelect.options[especialidadeSelect.selectedIndex].id),
    descricao: descricaoInput.value,
    emailPaciente: sessionStorage.getItem("email"),
    isTelemedicina: isConsultaOnline.options[isConsultaOnline.selectedIndex].value == 1 ? true : false
  }

  const response = await fetch(`${apiPrefix}Consulta/AgendarConsulta`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Adicionado cabeçalho Content-Type
    },
    body: JSON.stringify(data) // Converte o objeto para JSON
  })

  if(response.status == 401) {
    alert("Faça login novamente!")
  
    window.location.href = "https://kenedygondim.github.io/SP-Medical-Group-Front-End/html/login.html"
  } 
  else if (response.status == 201) {
    alert("Consulta agendada com sucesso!") 
    window.location.href = "./portal-do-paciente/agenda.html"
  } 
  else {
    alert("Não foi possível realizar o agendamento. Tente novamente mais tarde!")
  }

});

function retornaDataFormatada(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses são baseados em zero
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function retornaDisponibiliadesMaioresQueHoraAtual (disponibilidades) {
  let disponibiliadesMaioresQueHoraAtual = [];
  disponibilidades.forEach(disponibilidade => {

    const dataAtual = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split('/').reverse().join('-');
    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, 
      });

    const horaDisp = disponibilidade.horaInicio;


    if (horaDisp > horaAtual) {
      disponibiliadesMaioresQueHoraAtual.push(disponibilidade);
    }
  });

  console.log(disponibiliadesMaioresQueHoraAtual);


  return disponibiliadesMaioresQueHoraAtual;
}

function formatAddress(address) {
  return encodeURIComponent(address);
}

function formatarData (data) {
  return data.split('-').reverse().join('/');
}