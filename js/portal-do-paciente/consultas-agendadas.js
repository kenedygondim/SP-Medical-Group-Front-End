const currentDateHTML = document.getElementById('current-date');
let currentDate = new Date();


document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem("token")
    
    const acesso = await fetch('http://localhost:8080/api/Consulta/Acessar', {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
    }});
    
    if (acesso.status == 401) 
        window.location.href = "http://127.0.0.1:5500/html/login.html"
  
    const response = await fetch('http://localhost:8080/api/Consulta/ListarTodasConsultasPaciente?email=' + sessionStorage.getItem("email"), {
        method: 'GET',
        headers: {
        Authorization: `Bearer ${token}`
        }
    });
    
    consultasPaciente = await response.json();

    currentDateHTML.textContent = currentDate.toLocaleDateString();

    mostrarConsultas();
});

document.getElementById("prev-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    mostrarConsultas();
});

document.getElementById("next-day").addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    currentDateHTML.textContent = currentDate.toLocaleDateString();
    mostrarConsultas();
}); 

function mostrarConsultas() {
    document.querySelectorAll(".div-card").forEach(e => e.remove());
    document.querySelectorAll(".div-card-none").forEach(e => e.remove());

    const consultas = document.getElementById("appointments")

    const consultasDoDia = consultasPaciente.filter(consulta => {
        return consulta.dataConsulta == currentDateHTML.textContent;
    });

    console.log(consultasPaciente)


    if (consultasDoDia.length > 0) {
        consultasDoDia.forEach(consulta => {    
            const divCard = document.createElement("div");
            divCard.className = "div-card";

            const nomeMedico = document.createElement("h3");
            nomeMedico.textContent = consulta.nomeMedico;
            nomeMedico.className = "nome-medico";

            const dataConsulta = document.createElement("p");
            dataConsulta.textContent = consulta.dataConsulta;
            dataConsulta.className = "data-consulta";

            const especialidade = document.createElement("p");
            especialidade.textContent = consulta.especialidade;
            especialidade.className = "especialidade";

            const status = document.createElement("p");
            status.textContent = consulta.situacao;
            status.className = "status";

            const horario = document.createElement("p");
            horario.textContent = consulta.horaInicio + " - " + consulta.horaFim;
            horario.className = "horario";

            divCard.appendChild(nomeMedico);
            divCard.appendChild(dataConsulta);
            divCard.appendChild(especialidade);
            divCard.appendChild(status);
            divCard.appendChild(horario);

            consultas.appendChild(divCard);
        });
    } else {
        const divCardNone = document.createElement("div");
        divCardNone.className = "div-card-none";

        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhuma consulta agendada para este dia.";
        mensagem.className = "mensagem";

        divCardNone.appendChild(mensagem);

        consultas.appendChild(divCardNone);
    }
}