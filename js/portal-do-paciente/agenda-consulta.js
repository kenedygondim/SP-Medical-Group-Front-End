
const avancarButton = document.getElementById('avancar');
const voltarButton = document.getElementById('voltar');
const formSelecao = document.getElementById('form-selecao');
const resumoConsultaDiv = document.getElementById('resumo-consulta');
const valorConsultaText = document.getElementById('valor-consulta');
const enderecoConsultaText = document.getElementById('endereco-consulta');
const medicoConsultaText = document.getElementById('medico-consulta');
const especialidadeConsultaText = document.getElementById('especialidade-consulta');
const dataConsultaText = document.getElementById('data-consulta');
const horaConsultaText = document.getElementById('horario-consulta');
const especialidadeSelect = document.getElementById('especialidade');
const dataInput = document.getElementById('data');
const horarioSelect = document.getElementById('horario');
const medicoSelect = document.getElementById('medico');
const resumoConsulta = document.getElementById('resumo-consulta');

const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses são baseados em zero
const dia = String(hoje.getDate()).padStart(2, '0');
const dataAtual = `${ano}-${mes}-${dia}`;

document.addEventListener('DOMContentLoaded', carregarMedicos)



async function carregarMedicos() {
  const response = await fetch('http://localhost:8080/api/Medico/ListarTodos');
  const medicos = await response.json();

  const urlParams = new URLSearchParams(window.location.search);
  const medicoQuery = urlParams.get('medico');

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
  });
}

async function carregarEspecialidades(cpf) {
  const response = await fetch(`http://localhost:8080/api/Especialidade/obterEspecialidadesMedico?cpf=${cpf}`);
  const especialidades = await response.json();

  especialidadeSelect.innerHTML = '<option value="">Selecione uma especialidade</option>';
  especialidades.forEach(esp => {
    const option = document.createElement('option');
    option.setAttribute('especialidade-id', esp.especialidadeId);
    option.value = esp.nome;
    option.textContent = esp.nome;
    especialidadeSelect.appendChild(option);
  });
}

async function carregarDisponibilidades(cpf, data) {
  const formattedData = data.split('-').reverse().join('/');
  const response = await fetch(`http://localhost:8080/api/Disponibilidade/listarDisponibilidadesMedicoPorData?cpf=${cpf}&data=${formattedData}`);
  const disponibilidades = await response.json();
  
  if(disponibilidades.length == 0){
      horarioSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
      return;
  }

  horarioSelect.innerHTML = '<option value="">Selecione um horário</option>';
  disponibilidades.forEach(disponibilidade => {
    const option = document.createElement('option');
    option.setAttribute('disponibilidade-id', horario.id);
    option.value = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    option.textContent = `${disponibilidade.horaInicio} - ${disponibilidade.horaFim}`;
    horarioSelect.appendChild(option);
  });
}


medicoSelect.addEventListener('change', () => {
    const cpf = medicoSelect.value;
    if (cpf) 
      carregarEspecialidades(cpf);
    else 
      especialidadeSelect.innerHTML = '<option value="">Selecione um médico primeiro</option>';
});


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
    
    medicoConsultaText.textContent = `Médico: ${medicoSelect.options[medicoSelect.selectedIndex].text}`;
    especialidadeConsultaText.textContent = `Especialidade: ${especialidadeSelect.value}`;
    dataConsultaText.textContent = `Data: ${dataInput.value}`;
    horaConsultaText.textContent = `Horário: ${horarioSelect.value}`;
    const valorConsulta = details.valorConsulta; 
    const endereco = `${details.logradouro}, ${details.numero} ${details.complemento} - ${details.bairro}, ${details.municipio}, SP`;
  
    valorConsultaText.textContent = `Valor da Consulta: R$ ${valorConsulta}`;
    enderecoConsultaText.textContent = `Endereço da Consulta: ${endereco}`;
  }
  else {
      window.location.href = "http://127.0.0.1:5500/html/login.html"
  }
}
    

voltarButton.addEventListener('click', () => {
  resumoConsultaDiv.classList.remove('form-active');
  formSelecao.classList.add('form-active');
});


avancarButton.addEventListener('click', () => {
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


dataInput.addEventListener('change', () => {
  const cpf = medicoSelect.value;
  const data = dataInput.value;
  dataInput.min = dataAtual;
  
  console.log(cpf + " e " + data)

  if (cpf && data) {
    carregarDisponibilidades(cpf, data);
  } else {
    horarioSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
  }
});

resumoConsulta.addEventListener('submit', async (event) => {
  event.preventDefault()

  const data = {
    disponibilidadeId: horarioSelect.options[horarioSelect.selectedIndex].getAttribute('disponibilidade-id'),
    especialidaeId: especialidadeSelect.option[especialidadeSelect.selectedIndex].getAttribute('especialidade-id'),
    situacao: "Agendada",
    descricao: "Teste TESTE",
    cpfPaciente: sessionStorage.getItem("email"),
    isTelemedicina: false
  }

  const response = await fetch("http://localhost:8080/api/Consulta/Agendar", {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: data
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
