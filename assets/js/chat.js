// Aguarda o conteúdo da página ser totalmente carregado
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  // ATUALIZADO: URL aponta para a porta 3000 e a rota /chatAmina
  const BACKEND_URL = "http://localhost:3000/chatAmina";

  // Adiciona um listener para o envio do formulário
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const messageText = chatInput.value.trim();
    if (!messageText) {
      return; // Não envia mensagens vazias
    }

    // 1. Exibe a mensagem do usuário na tela
    addMessage(messageText, "user");

    // Limpa o input
    chatInput.value = "";

    try {
      // 2. Envia a mensagem para o backend
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ATUALIZADO: Envia a chave "message", como o novo server.js espera
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao conectar com o servidor.");
      }

      const data = await response.json();

      // 3. ATUALIZADO: Recebe a chave "reply", como o novo server.js envia
      addMessage(data.reply, "ai");
    } catch (error) {
      console.error("Erro na requisição fetch:", error);
      // 4. Exibe uma mensagem de erro no chat
      addMessage(
        `Desculpe, não consegui me conectar. (Erro: ${error.message})`,
        "ai-error"
      );
    }
  });

  /**
   * Função auxiliar para adicionar mensagens ao contêiner do chat
   * @param {string} text - O texto da mensagem
   * @param {('user' | 'ai' | 'ai-error')} type - O tipo de mensagem (para estilização)
   */
  function addMessage(text, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", `message-${type}`);

    messageElement.innerText = text;

    chatMessages.appendChild(messageElement);

    // Rola para a mensagem mais recente
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
