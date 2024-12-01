formElement = document.getElementById('form')

function toggleElements() {
    const textos = document.getElementById('textos');
    const form = document.getElementById('div-form');
    const button = document.getElementById('proximo-button');

    if (textos.classList.contains('hidden')) {
        textos.classList.remove('hidden');
        button.classList.remove('hidden');
        form.classList.add('hidden');
    } else {
        textos.classList.add('hidden');
        button.classList.add('hidden');
        form.classList.remove('hidden');
    }
}


formElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value

    try {
        const response = await fetch('http://localhost:8080/api/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            sessionStorage.setItem('token', token);
            window.location.href = '../index.html';

            
        } else {
            document.getElementById("login-falhou").classList.remove('hidden');
        }
    } catch (error) {
        console.log(error);
    }

});
