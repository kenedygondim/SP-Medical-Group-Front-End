formElement = document.getElementById('form')

console.log(sessionStorage.getItem("token"));
console.log(sessionStorage.getItem("role"));

document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("token");

    if(token) {
        const teste = fetch('http://localhost:8080/api/Medico/Acessar', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        teste.then((response) => {
            if (response.status == 200) {
                const role = sessionStorage.getItem("role");
                if (role == "1") 
                    window.location.href = 'http://127.0.0.1:5500/html/paciente.html';
                else if (role == "2") 
                    window.location.href = 'http://127.0.0.1:5500/html/medico.html';
                else if (role == "3") 
                    window.location.href = 'http://127.0.0.1:5500/html/admin.html';
            }
        });
    }
});

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
            



            if (sessionStorage.getItem('role') == "1") 
                    window.location.href = '../html/paciente.html';



            else if (sessionStorage.getItem('role') == "2") 

                    try {
                        const response = await fetch('http://localhost:8080/api/Medico/Acessar', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }).then((response) => {
                            if (response.status == 200) 
                                window.location.href = 'http://127.0.0.1:5500/html/medico.html'
                            else 
                                alert("Acesso negado");
                        });
                    } catch (error) 
                    {
                    console.log(error);
                    }


            else if (sessionStorage.getItem('role') == "3") {
                    window.location.href = '../html/admin.html';
            }    
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