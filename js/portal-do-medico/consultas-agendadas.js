const currentDateHTML = document.getElementById('current-date');
let currentDate = new Date();

document.addEventListener('DOMContentLoaded', async () => {
    await fetchItems();


});

async function fetchItems() {
    const token = sessionStorage.getItem("token")
    const email = sessionStorage.getItem("email")
    
    const acesso = await fetch('http://localhost:8080/api/Consulta/Acessar', {
        method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    const consultasMedico = await fetch('http://localhost:8080/api/Consulta/ListarTodosConsultasMedico?email=' + email, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    
    const InfoBasicasUsuario = await fetch(`http://localhost:8080/api/Medico/InfoBasicasUsuario?email=${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if(!consultasMedico.status == 200) {
        const errorMessage = await consultasMedico.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    if(!acesso.status == 200) {
        const errorMessage = await acesso.text();
        throw new Error(`Erro na requisição: ${errorMessage}`);
    }

    consultasMedicoJson = await consultasMedico.json();
    currentDateHTML.textContent = currentDate.toLocaleDateString();

    const InfoBasicasUsuarioJson = await InfoBasicasUsuario.json();
    document.getElementById("foto-perfil-options").src = InfoBasicasUsuarioJson.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : InfoBasicasUsuarioJson.fotoPerfilUrl;

    mostrarConsultas();
}

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
    const consultas = document.getElementById("appointments");

    // Adiciona efeito de saída
    consultas.classList.add('fade-out');
    
    // Aguarda o efeito de saída antes de atualizar o conteúdo
    setTimeout(() => {
        document.querySelectorAll(".div-card").forEach(e => e.remove());
        document.querySelectorAll(".div-card-none").forEach(e => e.remove());


        console.log(consultasMedicoJson);

        const consultasDoDia = consultasMedicoJson.filter(consulta => {
            return formatarData(consulta.dataConsulta) == currentDateHTML.textContent;
        });

        if (consultasDoDia.length > 0) {
            consultasDoDia.forEach(consulta => {    

                const divCard = document.createElement("div");
                divCard.className = "div-card";

                const fotoMedico = document.createElement("img");
                fotoMedico.src = consulta.fotoPerfilUrl == "" ? "../../assets/foto-medicos-teste/vetor-de-ícone-foto-do-avatar-padrão-símbolo-perfil-mídia-social-sinal-259530250.webp" : consulta.fotoPerfilUrl;
                fotoMedico.className = "foto-medico";

                const nomeMedico = document.createElement("h3");
                nomeMedico.textContent = consulta.nomePaciente;
                nomeMedico.className = "nome-medico";


                const especialidade = document.createElement("p");
                especialidade.textContent = consulta.especialidade;
                especialidade.className = "especialidade";

                const status = document.createElement("p");
                status.textContent = consulta.situacao;
                status.className = "status";

                const horario = document.createElement("p");
                horario.textContent = consulta.horaInicio + " - " + consulta.horaFim;
                horario.className = "horario";

                divCard.appendChild(fotoMedico);
                divCard.appendChild(nomeMedico);
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

        // Adiciona efeito de entrada
        consultas.classList.remove('fade-out');
        consultas.classList.add('fade-in');

    }, 200); // Tempo do efeito de saída
}

function formatarData (data) {
    return data.split('-').reverse().join('/');
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token inválido', error);
        return null;
    }
}