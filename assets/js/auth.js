// auth.js - Guardião de Rotas

// Esta função verifica se o usuário está "logado"
(function() {
  // Pega o item 'isLoggedIn' do sessionStorage. Se não existir, será null.
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');

  // Se 'isLoggedIn' não for estritamente igual a 'true'
  if (isLoggedIn !== 'true') {
    // Redireciona o usuário para a página de login
    window.location.href = 'login.html';
  }
})(); // A função é auto-executada assim que o script é carregado