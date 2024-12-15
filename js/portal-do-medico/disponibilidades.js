



document.getElementById('availabilityForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;

    const body = {
        cpfMedico: "11111111111",
        dataDisp: date,
        horaInicio: startTime,
        horaFim: endTime
    };

    await fetch('http://localhost:8080/api/Disponibilidade/adicionar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    }).then((response) => {
        if (response.ok) {
            alert('Disponibilidade cadastrada com sucesso!');
        } else {
            alert('Erro ao cadastrar disponibilidade!');
        }
    });
});