// Referência a elementos HTML
const formElement = document.getElementById('form')
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const loadingScreen = document.getElementById("loading-screen");
const textos = document.getElementById('textos');
const form = document.getElementById('div-form');
const button = document.getElementById('proximo-button');
const spanCadastro = document.getElementById('span-cadastre-se');
const closePopup = document.getElementById('close-popup');
const toStep2 = document.getElementById('to-step-2');
const backToStep1 = document.getElementById('back-to-step-1');
const backToStep2 = document.getElementById('back-to-step-2');
const toStep3 = document.getElementById('to-step-3');
const cpfInput = document.getElementById('cpf');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const rgInput = document.getElementById('rg');
const dataNascimentoInput = document.getElementById('dob');
const emailCadastroInput = document.getElementById('email-cadastro');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const cepInput = document.getElementById('cep');
const numeroInput = document.getElementById('numero');
const complementoInput = document.getElementById('complemento');
const cpfError = document.getElementById('cpf-error');
const firstNameError = document.getElementById('first-name-error');
const lastNameError = document.getElementById('last-name-error');
const rgError = document.getElementById('rg-error');
const dataNascimentoError = document.getElementById('dob-error');
const emailCadastroError = document.getElementById('email-cadastro-error');
const passwordError = document.getElementById('password-error');
const confirmPasswordError = document.getElementById('confirm-password-error');
const cepError = document.getElementById('cep-error');
const numeroError = document.getElementById('numero-error');
const complementoError = document.getElementById('complemento-error');


// Evento de inicialização
document.addEventListener("DOMContentLoaded", async () => {
    loadingScreen.style.display = "none";
    await realizarLogin();
});

// Prefixo de chamada de API
const apiPrefix = "http://localhost:8080/api/";

// Função para realizar login manual
formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    
    try {
        const response = await fetch(`${apiPrefix}Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

        const responseJson = await response.json();
        if (response.status == 200) {
            const token = responseJson.token;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('role', parseJwt(token).role);
            sessionStorage.setItem('email', email);
            await realizarLogin();
        }
        else if (response.status == 400) {
            document.getElementById("login-falhou").classList.remove('hidden'); 
            return;
        }
    } catch (error) {
        alert('Erro ao fazer login. Verifique sua conexão.');
    }
});

// Função para verificar se há token e redirecionar o usuário
async function realizarLogin() {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token && role) {
        await redirecionaUsuario();
    }
}

// Função para redirecionar o usuário para a página correta
async function redirecionaUsuario() {
    try {
        const token = sessionStorage.getItem("token");
        const role = sessionStorage.getItem("role");

        const nomeRole = retornaNomeDaRole(role);

        console.log(nomeRole);
        console.log(token);
        console.log(role);

        console.log(`${apiPrefix}${nomeRole}/Acessar`);

        if (nomeRole == null) 
            throw new Error('Não foi possível identificar as credenciais do usuário.');

        const response = await fetch(`${apiPrefix}${nomeRole}/Acessar`, {
            method: 'GET',
            headers: { 
                'contentType': 'application/json;',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.status == 200) 
            window.location.href = `http://127.0.0.1:5500/html/portal-do-${nomeRole.toLocaleLowerCase()}/${nomeRole.toLocaleLowerCase()}.html`    
       
    } catch (error) {
        alert('Erro ao acessar o portal');
        console.error(error);
    }         
}

// Evento de clique para avançar/voltar na pagina e ir para o formulário de login/cadastro
function toggleElements() {
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

// Evento de clique para abrir o popup de cadastro
spanCadastro.addEventListener('click', () => {
    popup.classList.add('active');
    overlay.classList.add('active');
});

// Evento de clique para fechar o popup de cadastro
closePopup.addEventListener('click', () => {
    popup.classList.remove('active');
    overlay.classList.remove('active');
});

// Eventos de clique para avançar/voltar nas etapas do cadastro
toStep2.addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
});
toStep3.addEventListener('click', () => {
    step2.classList.add('hidden');
    step3.classList.remove('hidden');
});
backToStep1.addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
});
backToStep2.addEventListener('click', () => {
    step3.classList.add('hidden');
    step2.classList.remove('hidden');
});


//Validações dos campos de cadastro
cpfInput.addEventListener('input', () => {
    const cpfValue = cpfInput.value;
    if (!/^\d{11}$/.test(cpfValue)) {
        cpfInput.classList.add('error');
        cpfInput.classList.remove('success');
        cpfError.textContent = 'O CPF deve conter exatamente 11 dígitos numéricos.';
    } else {
        cpfInput.classList.add('success');
        cpfInput.classList.remove('error');
        cpfError.textContent = '';
}
});

firstNameInput.addEventListener('input', () => {
    const firstNameValue = firstNameInput.value;

    if (firstNameValue.length < 3) {
        firstNameInput.classList.add('error');
        firstNameInput.classList.remove('success');
        firstNameError.textContent = 'O nome deve conter no mínimo 3 caracteres.';
    } else {
        firstNameInput.classList.add('success');
        firstNameInput.classList.remove('error');
        firstNameError.textContent = '';
    }
    }
);

lastNameInput.addEventListener('input', () => {
    const lastNameValue = lastNameInput.value;

    if (lastNameValue.length < 3) {
        lastNameInput.classList.add('error');
        lastNameInput.classList.remove('success');
        lastNameError.textContent = 'O sobrenome deve conter no mínimo 3 caracteres.';
    } else {
        lastNameInput.classList.add('success');
        lastNameInput.classList.remove('error');
        lastNameError.textContent = '';
    }
});

rgInput.addEventListener('input', () => {
    const rgValue = rgInput.value;

    if (!/^\d{9}$/.test(rgValue)) {
        rgInput.classList.add('error');
        rgInput.classList.remove('success');
        rgError.textContent = 'O RG deve conter exatamente 9 dígitos numéricos.';
    } else {
        rgInput.classList.add('success');
        rgInput.classList.remove('error');
        rgError.textContent = '';
}
});


dataNascimentoInput.addEventListener('input', () => {
    const dobValue = new Date(dataNascimentoInput.value); // Data de nascimento fornecida
    const today = new Date(); // Data atual

    // Calcula a diferença em anos
    const age = today.getFullYear() - dobValue.getFullYear();
    const monthDifference = today.getMonth() - dobValue.getMonth();
    const dayDifference = today.getDate() - dobValue.getDate();

    // Verifica se o usuário tem 18 anos completos
    const is18OrOlder = 
        age > 18 || 
        (age === 18 && monthDifference > 0) || 
        (age === 18 && monthDifference === 0 && dayDifference >= 0);

    if (!is18OrOlder) {
        dataNascimentoInput.classList.add('error');
        dataNascimentoInput.classList.remove('success');
        dataNascimentoError.textContent = 'Você deve ter pelo menos 18 anos para se cadastrar.';
    } else {
        dataNascimentoInput.classList.add('success');
        dataNascimentoInput.classList.remove('error');
        dataNascimentoError.textContent = '';
    }
});

emailCadastroInput.addEventListener('input', () => {
    const emailValue = emailCadastroInput.value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        emailCadastroInput.classList.add('error');
        emailCadastroInput.classList.remove('success');
        emailCadastroError.textContent = 'Insira um e-mail válido.';
    } else {
        emailCadastroInput.classList.add('success');
        emailCadastroInput.classList.remove('error');
        emailCadastroError.textContent = '';
    }
});

passwordInput.addEventListener('input', () => {
    const passwordValue = passwordInput.value;

    // Verifica se a senha atende os critérios
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(passwordValue)) {
        passwordInput.classList.add('error');
        passwordInput.classList.remove('success');
        passwordError.textContent = 'A senha deve ter pelo menos 8 caracteres, incluindo pelo menos uma letra e um número.';
    } else {
        passwordInput.classList.add('success');
        passwordInput.classList.remove('error');
        passwordError.textContent = '';
    }

    // Revalida a confirmação de senha
    validateConfirmPassword();
});


// Validação do campo de confirmação de senha
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

function validateConfirmPassword() {
    const passwordValue = passwordInput.value;
    const confirmPasswordValue = confirmPasswordInput.value;

    // Verifica se a confirmação é igual à senha
    if (confirmPasswordValue !== passwordValue) {
        confirmPasswordInput.classList.add('error');
        confirmPasswordInput.classList.remove('success');
        confirmPasswordError.textContent = 'As senhas não correspondem.';
    } else {
        confirmPasswordInput.classList.add('success');
        confirmPasswordInput.classList.remove('error');
        confirmPasswordError.textContent = '';
    }
}

cepInput.addEventListener('input', () => {
    const cepValue = cepInput.value;

    if (cepValue.length !== 8 || isNaN(cepValue)) {
        cepInput.classList.add('error');
        cepInput.classList.remove('success');
        cepError.textContent = 'O CEP deve conter exatamente 8 números.';
    } else {
        cepInput.classList.add('success');
        cepInput.classList.remove('error');
        cepError.textContent = '';
    }
});

// Validação do Número
numeroInput.addEventListener('input', () => {
    const numeroValue = numeroInput.value;

    if (numeroValue.length > 10) {
        numeroInput.classList.add('error');
        numeroInput.classList.remove('success');
        numeroError.textContent = 'O número deve conter no máximo 10 caracteres.';
    } else {
        numeroInput.classList.add('success');
        numeroInput.classList.remove('error');
        numeroError.textContent = '';
    }
});

// Validação do Complemento
complementoInput.addEventListener('input', () => {
    const complementoValue = complementoInput.value;

    if (complementoValue.length > 50) {
        complementoInput.classList.add('error');
        complementoInput.classList.remove('success');
        complementoError.textContent = 'O complemento deve conter no máximo 50 caracteres.';
    } else {
        complementoInput.classList.add('success');
        complementoInput.classList.remove('error');
        complementoError.textContent = '';
    }
});

// Evento para verificar validade do CEP
document.getElementById('cep').addEventListener('blur', async () => {
    const cep = document.getElementById('cep').value;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            alert('CEP não encontrado.');
            return
        }   
        document.getElementById('uf').value = data.uf;
        document.getElementById('municipio').value = data.localidade;
        document.getElementById('bairro').value = data.bairro;
        document.getElementById('logradouro').value = data.logradouro;
        document.getElementById('uf').disabled = true;
        document.getElementById('municipio').disabled = true;
        document.getElementById('bairro').disabled = true;
        document.getElementById('logradouro').disabled = true;

    } catch (error) {
        alert('Erro ao buscar o CEP. ');
    }
});

document.getElementById('submit').addEventListener('click', async () => {
    
    loadingScreen.style.display = "flex";

    var formData = new FormData();
    formData.append('cpf', cpfInput.value);
    formData.append('nomeCompleto', firstNameInput.value + ' ' + lastNameInput.value);
    formData.append('dataNascimento', dataNascimentoInput.value);
    formData.append('rg', rgInput.value);
    formData.append('email', emailCadastroInput.value);
    formData.append('senha', passwordInput.value);
    formData.append('cep', cepInput.value);
    formData.append('uf', document.getElementById('uf').value);
    formData.append('municipio', document.getElementById('municipio').value);
    formData.append('bairro', document.getElementById('bairro').value);
    formData.append('logradouro', document.getElementById('logradouro').value);
    formData.append('numero', numeroInput.value);
    formData.append('complemento', complementoInput.value);

    var foto = document.getElementById('foto-perfil').files[0]

    if (foto != null) {
        formData.append('fotoPerfilFile', foto);
    }

    try {
        const response = await fetch(`${apiPrefix}Paciente/Cadastrar`, {
        method: 'POST',
        body: formData
        });

        const responseJ = await response.json();

        console.log(response);
        console.log(responseJ);


        if (response.ok) {
            alert('Conta criada com sucesso!');
            popup.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            alert('Erro ao criar a conta. Verifique os dados e tente novamente.');
        }
    } catch (error) {
        alert('Erro ao criar a conta. Verifique sua conexão.'); //TO-DO: consertar aqui
    }
    finally {
        loadingScreen.style.display = "none";
    }

});

//Utils
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