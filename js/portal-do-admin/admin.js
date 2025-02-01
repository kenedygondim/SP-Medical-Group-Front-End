const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const loadingScreen = document.getElementById("loading-screen");
const textos = document.getElementById('textos');
const form = document.getElementById('div-form');
const button = document.getElementById('proximo-button');

// Prefixo de chamada de API
const apiPrefix = "https://44.210.248.181:5001/api/";

// Recupera o token da sessão
const token = sessionStorage.getItem("token");
const email = sessionStorage.getItem("email");


document.querySelectorAll('.div-actions').forEach((div) => {
    div.addEventListener('click', (e) => {
        openPopup(e.target.id);
    });
});

function openPopup(idAction) {
    document.querySelector('.form-section').innerHTML = '';

    document.querySelector('.fundo-escuro').style.display = 'block'
    popup.classList.add('active');

    switch (idAction) {
        case 'cadastrar-hospital':
            createHtmlCadastrarHospital();
            break;
        case 'atualizar-hospital':
            createHtmlAtualizarHospital();
            break;
        case 'remover-hospital':
            createHtmlRemoverHospital();
            break;
        case 'cadastrar-medico':
            createHtmlCadastrarMedico();
            break;
        case 'remover-medico':
            createHtmlRemoverMedico();
            break;
        case 'remover-usuario':
            createHtmlRemoverUsuario();
            break;
        case 'adicionar-especialidade':
            createHtmlAdicionarAreaEspecialidade();
            break;
        case 'adicionar-role':
            createHtmlAdicionarRole();
            break;
        case 'remover-especialidade':
            createHtmlRemoverAreaEspecialidade();
            break;
        default:
            console.log('Nenhuma ação encontrada');
            break;
    }
}

document.getElementById('close-popup').addEventListener('click', () => {
    document.querySelector('.fundo-escuro').style.display = 'none'
    popup.classList.remove('active');
});

function createHtmlCadastrarHospital() {
    document.querySelector('.form-section').innerHTML = 
    `
        <h3 class="title-info">Cadastrar Hospital</h3>    
        <div class="form-group-inline">
            <div class="form-group">
                <label for="first-name">CNPJ: </label>
                <input type="text" id="first-name" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="first-name-error"></div>
                <br>
            </div>
            <div class="form-group">
                <label for="last-name">Nome Fantasia </label>
                <input type="text" id="last-name" class="inf-pessoais" required placeholder="Doe">
                <div class="error-message" id="last-name-error"></div>
                <br>
            </div>
        </div>
         <div id="step-3" class="form-section">
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="cep">CEP: </label>
                        <input type="text" id="cep" required maxlength="8" placeholder="12345678" class="inf-endereco">
                        <div class="error-message" id="cep-error"></div>
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="uf">UF: </label>
                        <input type="text" id="uf" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="municipio">Município: </label>
                        <input type="text" id="municipio" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                </div>
        
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="bairro">Bairro: </label>
                        <input type="text" id="bairro" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="logradouro">Logradouro: </label>
                        <input type="text" id="logradouro" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="numero">Número: </label>
                        <input type="text" id="numero" required placeholder="123" class="inf-endereco">
                        <div class="error-message" id="numero-error"></div>
                        <br>
                    </div>
                </div>
        
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="complemento">Complemento: </label>
                        <input type="text" id="complemento" placeholder="Casa, Apartamento, Bloco, etc.">
                        <div class="error-message" id="complemento-error"></div>
                        <br>
                    </div>
                </div>
        </div>
                <div class="actions">
                    <button id="submit" class="register-btn">Registrar</button>
                </div>
    `
}

function createHtmlAtualizarHospital() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Atualizar Hospital</h3>    
        <div class="form-group-inline">
            <div class="form-group">
                <label for="first-name">CNPJ: </label>
                <input type="text" id="first-name" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="first-name-error"></div>
                <br>
            </div>
            <div class="form-group">
                <label for="last-name">Nome Fantasia </label>
                <input type="text" id="last-name" class="inf-pessoais" required placeholder="Doe">
                <div class="error-message" id="last-name-error"></div>
                <br>
            </div>
        </div>
         <div id="step-3" class="form-section">
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="cep">CEP: </label>
                        <input type="text" id="cep" required maxlength="8" placeholder="12345678" class="inf-endereco">
                        <div class="error-message" id="cep-error"></div>
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="uf">UF: </label>
                        <input type="text" id="uf" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="municipio">Município: </label>
                        <input type="text" id="municipio" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                </div>
        
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="bairro">Bairro: </label>
                        <input type="text" id="bairro" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="logradouro">Logradouro: </label>
                        <input type="text" id="logradouro" required disabled placeholder="Campo com preenchimento automático. Insira seu CEP.">
                        <br>
                    </div>
                    <div class="form-group">
                        <label for="numero">Número: </label>
                        <input type="text" id="numero" required placeholder="123" class="inf-endereco">
                        <div class="error-message" id="numero-error"></div>
                        <br>
                    </div>
                </div>
        
                <div class="form-group-inline">
                    <div class="form-group">
                        <label for="complemento">Complemento: </label>
                        <input type="text" id="complemento" placeholder="Casa, Apartamento, Bloco, etc.">
                        <div class="error-message" id="complemento-error"></div>
                        <br>
                    </div>
                </div>
        </div>

        <div class="actions">
                    <button id="submit" class="register-btn">Registrar</button>
        </div>
    `;
}

function createHtmlRemoverHospital() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Remover Hospital</h3>
    <div class="form-group-inline">
            <div class="form-group">
                <label for="first-name">CNPJ do hospital: </label>
                <input type="text" id="first-name" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="first-name-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Remover</button>
    </div>
    `;
}

function createHtmlCadastrarMedico() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Cadastrar Conta Administradora</h3>
    <div class="form-group-inline">
            <div class="form-group">
                <label for="input-email-admin">Email: </label>
                <input type="text" id="input-email-admin" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="input-email-admin-error"></div>
                <br>
            </div>

            <div class="form-group">
                <label for="input-senha-admin">Senha: </label>
                <input type="text" id="input-senha-admin" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="input-senha-admin-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Remover</button>
    </div>
    `;
}

function createHtmlRemoverMedico() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Remover Médico</h3>
    <div class="form-group-inline">
            <div class="form-group">
                <label for="first-name">CPF ou CRM do médico: </label>
                <input type="text" id="first-name" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="first-name-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Remover</button>
    </div>
    `;
}

function createHtmlRemoverUsuario() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Remover Usuário</h3>
    <div class="form-group-inline">
            <div class="form-group">
                <label for="input-remover-usuario">ID do usuário </label>
                <input type="text" id="input-remover-usuario" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="input-remover-usuario-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Remover</button>
    </div>
    `;
}

function createHtmlAdicionarAreaEspecialidade() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Adicionar Especialidade</h3>
        <div class="form-group-inline">
            <div class="form-group">
                <label for="input-nome-especialidade">Nome da especialidade: </label>
                <input type="text" id="input-nome-especialidade" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="input-nome-especialidade-error"></div>
                <br>
            </div>
            <div class="form-group">
                <label for="input-descricao-especialidade">Descrição da especialidade: </label>
                <input type="text" id="input-descricao-especialidade" class="inf-pessoais" required placeh class="inf-pessoais"older="John">
                <div class="error-message" id="input-descricao-especialidade-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Adicionar</button>
    </div>
    
    `;
}

function createHtmlAdicionarRole() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Adicionar Perfil de Usuário</h3>
        <div class="form-group-inline">
            <div class="form-group">
                <label for="input-adicionar-role">Nome do perfil de usuário: </label>
                <input type="text" id="input-adicionar-role" class="inf-pessoais" required placeh class="inf-pessoais">
                <div class="error-message" id="adicionar-role-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button id="submit" class="register-btn">Adicionar</button>
    </div>
    `;
}

function createHtmlRemoverAreaEspecialidade() {
    document.querySelector('.form-section').innerHTML = 
    `
    <h3 class="title-info">Remover Especialidade</h3>
    <div class="form-group-inline">
            <div class="form-group">
                <label for="input-remover-especialidade">ID da especialidade: </label>
                <input type="text" id="input-remover-especialidade" class="inf-pessoais" required placeh class="inf-pessoais">
                <div class="error-message" id="remover-especialidade-error"></div>
                <br>
            </div>
    </div>
        <div class="actions">
        <button type="submit" id="submit" class="register-btn">Remover</button>
    </div>
    `;
}

// // Eventos de clique para avançar/voltar nas etapas do cadastro
// document.getElementById('to-step-2').addEventListener('click', () => {
//     step1.classList.add('hidden');
//     step2.classList.remove('hidden');
// });

// document.getElementById('to-step-3').addEventListener('click', () => {
//     step2.classList.add('hidden');
//     step3.classList.remove('hidden');
// });

// document.getElementById('back-to-step-1').addEventListener('click', () => {
//     step2.classList.add('hidden');
//     step1.classList.remove('hidden');
// });

// document.getElementById('back-to-step-2').addEventListener('click', () => {
//     step3.classList.add('hidden');
//     step2.classList.remove('hidden');
// });

async function cadastrarHospital() {
    // TO-DO: Implementar
}

async function atualizarHospital() {
    // TO-DO: Implementar
}

async function removerHospital() {
    // TO-DO: Implementar
}

async function cadastrarContaAdmin() {
    // TO-DO: Implementar
}

async function removerMedico() {
    // TO-DO: Implementar
}

document.querySelector('.form-section').addEventListener('submit', async function (e) {
    try {
        e.preventDefault();
        const idUsuario = document.getElementById('input-remover-usuario').value;

        const response = await fetch(`${apiPrefix}Usuario/ExcluirUsuario?idUsuario=${idUsuario}`, {
            method: 'DELETE'
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }    
        });

        const responseText = await response.text();

        if (response.status == 204) {
            alert('Usuário removido com sucesso!');
        } 
        else if (response.status == 400) {
            alert(responseText);
        }
    } catch (error) {
        console.error(error);
    }
});


document.querySelector('.form-section').addEventListener('submit', async function (e) {    
    try {
        e.preventDefault();
        const nomeEspecialidade = document.getElementById('input-nome-especialidade').value;
        const descricaoEspecialidade = document.getElementById('input-descricao-especialidade').value;

        const response = await fetch(`${apiPrefix}Especialidade/AdicionarEspecialidade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            } ,
            body: JSON.stringify(
                { 
                    nomeEspecialidade: nomeEspecialidade,
                    descricaoEspecialidade: descricaoEspecialidade
                }
            )
        });

        const responseText = await response.text();

        if (response.status == 201) {
            alert('Área de especialidade adicionada com sucesso!');
        } 
        else if (response.status == 400) {
            alert(responseText);
        }
    } catch (error) {
        console.error(error);
    }
});

document.querySelector('.form-section').addEventListener('submit', async function (e) {    
    try {
        e.preventDefault();
        const nomeRole = document.getElementById('input-adicionar-role').value.toUpperCase();

        console.log(nomeRole);

        const response = await fetch(`${apiPrefix}Role/AdicionarRole?nomeRole=${nomeRole}`, {
            method: 'POST'
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }    
        });

        const responseText = await response.text();

        if (response.status == 201) {
            alert('Perfil de usuário criado com sucesso!');
        } 
        else if (response.status == 400) {
            alert(responseText);
        }
    } catch (error) {
        console.error(error);
    }
});


document.querySelector('.form-section').addEventListener('submit', async function (e) {
    try {
        e.preventDefault();
        const idEspecialidade = document.getElementById('input-remover-especialidade').value;

        const response = await fetch(`${apiPrefix}Especialidade/ExcluirEspecialidade?idEspecialidade=${idEspecialidade}`, {
            method: 'DELETE'
            // headers: {
            //     'Authorization': `Bearer ${token}`
            // }    
        });

        const responseText = await response.text();

        if (response.status == 204) {
            alert('Especialidade removida com sucesso!');
        } 
        else if (response.status == 400) {
            alert(responseText);
        }
    } catch (error) {
        console.error(error);
    }
});


