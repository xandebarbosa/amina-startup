document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById('chat-container');
  
  if (chatContainer) {
    const chat = document.getElementById("chat");
    const userInput = document.getElementById("entrada");
    const sendButton = document.querySelector("#input-container button");

    // Função para adicionar mensagens à interface
    const adicionarMensagem = (remetente, texto, classe) => {
      const msgContainer = document.createElement("div");
      const msgBubble = document.createElement("div");
      
      msgContainer.className = "msg-container " + classe;
      msgBubble.className = "msg";
      msgBubble.textContent = texto;

      msgContainer.appendChild(msgBubble);
      chat.appendChild(msgContainer);
      chat.scrollTop = chat.scrollHeight;
    };

    // Função da Amina para responder (SIMULADA)
    const responder = (texto) => {
      const typing = document.createElement("div");
      typing.className = "msg-container amina";
      typing.innerHTML = `<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;

      let resposta = "Não entendi muito bem, mas estou aqui para te ouvir. Pode me explicar de outra forma?";
      const t = texto.toLowerCase();

      if (t.includes("oi") || t.includes("olá")) {
        resposta = "Oi! Eu sou a Amina. Estou aqui para apoiar você. Como está se sentindo?";
      } else if (t.includes("triste") || t.includes("sozinha") || t.includes("mal")) {
        resposta = "Sinto muito que esteja passando por isso. Lembre-se que você é forte. Quer conversar mais sobre o que está te deixando assim?";
      } else if (t.includes("feliz") || t.includes("bem")) {
        resposta = "Fico muito feliz por você! Compartilhar bons momentos também é muito importante. O que te deixou feliz hoje?";
      } else if (t.includes("ajuda") || t.includes("preciso de ajuda")) {
        resposta = "Claro! Você pode me contar o que está acontecendo e eu vou te apoiar da melhor forma. Se for uma emergência, ligue para 190 ou 180.";
      } else if (t.includes("obrigada") || t.includes("obrigado")) {
        resposta = "De nada! Estarei sempre aqui quando precisar conversar. Se cuida!";
      } else if (t.includes("sim") || t.includes("pode ser")) {
        resposta = "Estou aqui para te ouvir!";
      } else if (t.includes("tchau") || t.includes("até mais")) {
        resposta = "Tudo bem. Se cuida, você não está sozinha. Estarei aqui sempre que precisar conversar.";
      }

      setTimeout(() => {
        typing.remove();
        adicionarMensagem("Amina", resposta, "amina");
      }, 1500);
    };

    // Função para enviar a mensagem do usuário
    const enviar = () => {
      const texto = userInput.value;
      if (texto.trim() === "") return;
      
      adicionarMensagem("Você", texto, "user");
      responder(texto);
      userInput.value = "";
      userInput.focus();
    };

    // Adiciona os eventos
    sendButton.addEventListener('click', enviar);
    userInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        enviar();
      }
    });

    // Mensagem inicial da Amina
    setTimeout(() => {
      adicionarMensagem("Amina", "Olá! Eu sou a Amina, sua amiga virtual. Estou aqui para conversar e apoiar você. Como você está hoje?", "amina");
    }, 500);
  }
});