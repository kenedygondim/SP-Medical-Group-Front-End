const formSelecao = document.getElementById('form-selecao');
const resumoConsultaDiv = document.getElementById('resumo-consulta');
const especialidadeSelect = document.getElementById('especialidade');
const dataInput = document.getElementById('data');
const horarioSelect = document.getElementById('horario');
const medicoSelect = document.getElementById('medico');
const resumoConsulta = document.getElementById('resumo-consulta');
const descricaoInput = document.getElementById('descricao');
const isConsultaOnline = document.getElementById('online');

document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();

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
        window.location.href = "../index.html";
    });
  
    viewProfileOption.addEventListener("click", () => {
        window.location.href = "./meu-perfil.html";
    });


});

async function fetchItems() {
  const token = sessionStorage.getItem("token")
  const email = sessionStorage.getItem("email");

  const acesso = await fetch('http://localhost:8080/api/Consulta/Acessar', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
  }});

  if (acesso.status == 401) 
      window.location.href = "http://127.0.0.1:5500/html/login.html"

  const response = await fetch('http://localhost:8080/api/Medico/ListarTodos');
  const medicos = await response.json();

  const hoje = new Date();
  dataInput.min = retornaDataFormatada(hoje);

  const urlParams = new URLSearchParams(window.location.search);
  const medicoQuery = urlParams.get('medico');



  const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Paciente/InfoBasicasUsuario?email=${email}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});

  const InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
  document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;

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

})}

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

  const response = await fetch(`http://localhost:8080/api/Especialidade/obterEspecialidadesMedico?cpf=${cpf}`);
  const especialidades = await response.json();

  especialidadeSelect.innerHTML = '<option value="">Selecione uma especialidade</option>';
  especialidades.forEach(esp => {
    const option = document.createElement('option');
    option.id = esp.especialidadeId
    option.value = esp.nome;
    option.textContent = esp.nome;
    especialidadeSelect.appendChild(option);
  });
}

async function carregarDisponibilidades(cpf, data) {
  const response = await fetch(`http://localhost:8080/api/Disponibilidade/listarDisponibilidadesMedicoPorData?cpf=${cpf}&data=${data}`);
  const disponibilidades = await response.json();
  
  if(disponibilidades.length == 0){
      horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
      return;
  }

  horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
  disponibilidades.forEach(disponibilidade => {
    const option = document.createElement('option');
    option.id = disponibilidade.disponibilidadeId
    option.value = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    option.textContent = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    horarioSelect.appendChild(option);
  });
}

async function carregarResumo(cpf) {
  const token = sessionStorage.getItem("token")

  const response = await fetch(`http://localhost:8080/api/Consulta/ConfirmarConsultaDetalhes?cpf=${cpf}&nomeEspecialidade=${especialidadeSelect.value}`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    } 
  })

  if (response.status == 200) {
    const details = await response.json();
    document.getElementById('medico-consulta').textContent = `Médico: ${medicoSelect.options[medicoSelect.selectedIndex].text}`;
    document.getElementById('especialidade-consulta').textContent = `Especialidade: ${especialidadeSelect.value}`;
    document.getElementById('data-consulta').textContent = `Data: ${dataInput.value}`;
    document.getElementById('horario-consulta').textContent = `Horário: ${horarioSelect.value}`;
    document.getElementById('valor-consulta').textContent = `Valor da Consulta: R$ ${details.valorConsulta}`;
    document.getElementById('endereco-consulta').textContent = isConsultaOnline.options[isConsultaOnline.selectedIndex].value == 1 ? "Consulta online via Google Meet" : `Endereço da Consulta: ${details.logradouro}, ${details.numero} ${details.complemento} - ${details.bairro}, ${details.municipio}, SP`;
  }
  else {
      window.location.href = "http://127.0.0.1:5500/html/login.html"
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

  const response = await fetch("http://localhost:8080/api/Consulta/Agendar", {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Adicionado cabeçalho Content-Type
    },
    body: JSON.stringify(data) // Converte o objeto para JSON
  })

  if(response.status == 401) {
    alert("Faça login novamente!")
    window.location.href = "http://127.0.0.1:5500/html/login.html"
  } 
  else if (response.status == 201) {
    alert("Consulta agendada com sucesso!") 
    window.location.href = "http://127.0.0.1:5500/html/portal-do-paciente/consultas-agendadas.html"
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