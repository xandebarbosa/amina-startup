document.addEventListener('DOMContentLoaded', () => {
    // "Banco de dados" simulado para profissionais
    const professionals = {
        saude: ["CRM-12345", "CRM-67890", "SAUDE-001"],
        juridico: ["OAB-45678", "OAB-98765", "JUR-999"]
    };

    const loginForm = document.getElementById('login-form');
    const credForm = document.getElementById('cred-form');
    const loginSection = document.getElementById('login-section');
    const credSection = document.getElementById('cred-section');
    const credResult = document.getElementById('cred-result');
    const backButton = document.getElementById('back-to-login');

    // Função para registrar o login e redirecionar
    function successfulLogin(redirectPage = 'home.html') {
        // >>> PASSO CHAVE: Salva o estado de login no sessionStorage <<<
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Redireciona para a página principal
        window.location.href = redirectPage;
    }

    // Lida com o formulário de login inicial
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const role = document.getElementById('role').value;

        // VALIDAÇÃO: Verifica se um perfil foi selecionado
        if (role === "") {
            alert("Por favor, selecione seu perfil de acesso.");
            return; 
        }

        // Adicionar validação de usuário e senha se 'role' for 'usuario'
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (role === 'usuario' && (!username || !password)) {
            alert("Por favor, preencha o usuário e a senha.");
            return;
        }

        if (role === 'usuario') {
            alert('Bem-vinda à Amina!');
            //window.location.href = 'home.html';
            successfulLogin(); // Chama a nova função
        } else if (role === 'saude' || role === 'juridico') {
            loginSection.style.display = 'none';
            credSection.style.display = 'block';
            document.getElementById('cred-type').value = role; // Preenche o tipo no segundo form
            credResult.textContent = ''; // Limpa resultados anteriores
        }
    });

    // Lida com a verificação de credencial
    credForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const type = document.getElementById('cred-type').value;
        const credential = document.getElementById('credential').value.trim();
        
       // VALIDAÇÃO: Verifica se a credencial foi preenchida
        if (credential === "") {
             credResult.style.color = 'red';
             credResult.textContent = '❌ Por favor, preencha o número da credencial.';
             return;
        }

        if (professionals[type] && professionals[type].includes(credential)) {
            credResult.style.color = 'green';
            credResult.textContent = '✅ Credencial válida. Acesso permitido. Redirecionando...';
            setTimeout(() => {
                successfulLogin('home.html'); // Redireciona para home
            }, 2000);
        } else {
            credResult.style.color = 'red';
            credResult.textContent = '❌ Credencial inválida ou não encontrada.';
        }
    });

    // BOTÃO VOLTAR
    if (backButton) {
        backButton.addEventListener('click', (event) => {
            event.preventDefault();
            credSection.style.display = 'none';
            loginSection.style.display = 'block';
            document.getElementById('role').value = ""; // Reseta o select
        });
    }
});