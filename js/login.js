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
            sessionStorage.setItem('role', parseJwt(token).role);
            window.location.href = '../index.html';

            
        } else {
            document.getElementById("login-falhou").classList.remove('hidden');
        }
    } catch (error) {
        console.log(error);
    }

});


function parseJwt(token) {
    try {
        // Divide o token nas partes (header, payload, signature)
        const base64Url = token.split('.')[1];
        // Decodifica a seção payload de Base64Url para JSON
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