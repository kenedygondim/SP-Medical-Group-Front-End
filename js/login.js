const formElement = document.getElementById('form')
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

document.addEventListener("DOMContentLoaded", async () => {
    await realizarLogin();
});

formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
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
            sessionStorage.setItem('email', email);
            await realizarLogin();
        } else 
             document.getElementById("login-falhou").classList.remove('hidden'); 
    } catch (error) {
        alert('Erro ao fazer login. Verifique sua conexão.');
    }
});

async function realizarLogin() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    if (token) {
        console.log("5")
        await redirecionaUsuario(role, token);
    }
}

async function redirecionaUsuario(role, token) {
    const nomeRole = retornaNomeDaRole(role)
    await fetch(`http://localhost:8080/api/${nomeRole}/Acessar`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then((response) => {
            console.log("8")
            if (response.status == 200) 
                window.location.href = `http://127.0.0.1:5500/html/portal-do-${nomeRole}/${nomeRole}.html`;
        });
}

function retornaNomeDaRole (role) {
    switch (role) {
        case "1":
            return "Paciente";
        case "2":
            return "Medico";
        case "3":
            return "Admin";
    }
}

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

document.getElementById('span-cadastre-se').addEventListener('click', () => {
    popup.classList.add('active');
    overlay.classList.add('active');
});

document.getElementById('close-popup').addEventListener('click', () => {
    popup.classList.remove('active');
    overlay.classList.remove('active');
});

document.getElementById('to-step-2').addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
});

document.getElementById('back-to-step-1').addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
});

document.getElementById('cep').addEventListener('blur', async () => {
    const cep = document.getElementById('cep').value;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById('uf').value = data.uf;
            document.getElementById('municipio').value = data.localidade;
            document.getElementById('bairro').value = data.bairro;
            document.getElementById('logradouro').value = data.logradouro;
            document.getElementById('uf').disabled = true;
            document.getElementById('municipio').disabled = true;
            document.getElementById('bairro').disabled = true;
            document.getElementById('logradouro').disabled = true;
        } else {
            alert('Erro ao buscar o CEP. Verifique se está correto.');
        }
    } catch (error) {
        alert('Erro ao buscar o CEP. Verifique sua conexão.');
    }
});

document.getElementById('submit').addEventListener('click', async () => {
    const payload = {
        cpf: document.getElementById('cpf').value,
        nomeCompleto: document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value,
        dataNascimento: document.getElementById('dob').value,
        rg: document.getElementById('rg').value,
        email: document.getElementById('email-cadastro').value,
        senha: document.getElementById('password').value,
        cep: document.getElementById('cep').value,
        uf: document.getElementById('uf').value,
        municipio: document.getElementById('municipio').value,
        bairro: document.getElementById('bairro').value,
        logradouro: document.getElementById('logradouro').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        }

    try {
        const response = await fetch('http://localhost:8080/api/Paciente/Cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Conta criada com sucesso!');
            popup.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            alert('Erro ao criar a conta. Verifique os dados e tente novamente.');
        }
    } catch (error) {
        alert('Erro ao criar a conta. Verifique sua conexão.');
    }
});