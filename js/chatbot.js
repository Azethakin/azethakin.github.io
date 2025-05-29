let conversationHistory = [];
let isWaiting = false;
let controller = null;

window.userScrolledUp = false;


// Appliquer le dark mode au chargement si choisi avant
if(localStorage.getItem('azizChatDarkMode') === 'on'){
  document.body.classList.add('dark');
}


// Échappe le HTML pour affichage sécurisé
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}




async function streamBlocks(element, markdown, speed = 10) {
  let segments = markdown.split(/(?:\r?\n){2,}/g).filter(seg => seg.trim() !== '');

  const contentDiv = element.querySelector(".reply-content");
  const typingIndicator = element.querySelector(".typing-indicator");

  if (!contentDiv) {
    console.warn("❌ .reply-content introuvable dans element");
    return;
  }

  marked.setOptions({
    langPrefix: 'hljs language-',
    breaks: true
  });

  for (let seg of segments) {
    let rawHtml = '';
    try {
      rawHtml = marked.parse(seg);
    } catch (e) {
      console.warn("Erreur de parsing Markdown :", e);
      rawHtml = `<pre>${escapeHTML(seg)}</pre>`;
    }

    const safeHtml = DOMPurify.sanitize(rawHtml);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = safeHtml;
    contentDiv.appendChild(tempDiv);

    hljs.highlightAll();
    addCopyButtons();
    scrollToBottom();

    await new Promise(r => setTimeout(r, speed * 10 + seg.length * 2));
  }

  if (typingIndicator) typingIndicator.remove(); // ← Supprime l'animation à la fin
  const assistantImg = element.querySelector('.assistant-photo');
  if (assistantImg) assistantImg.classList.remove('pulse');
}



function displayCachedReply(input, reply) {
const chatDiv = document.getElementById("chatHistory");

// Affichage utilisateur
const userMessage = document.createElement("div");
userMessage.className = "message-block";
userMessage.innerHTML = `<span class="user"></span><pre><code>${escapeHTML(input)}</code></pre>`;
chatDiv.appendChild(userMessage);

// Affichage réponse assistant (cache)
const cachedDiv = document.createElement("div");
cachedDiv.className = "message-block";
cachedDiv.innerHTML = `<span class="assistant"><img src="../images/images_chatbot/aziz-photo.png" alt="Aziz" class="assistant-photo"> <span class="assistant-label">Aziz :</span></span>${DOMPurify.sanitize(marked.parse(reply))}`;

chatDiv.appendChild(cachedDiv);
hljs.highlightAll();
scrollToBottom();
}

// Envoie le message
async function sendMessage() {
  if (isWaiting) return;

  window.userScrolledUp = false;

  const inputField = document.getElementById("userInput");
  const input = inputField.value.trim();
  if (!input) return;
  inputField.value = "";

  isWaiting = true;

  document.getElementById("sendBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "inline-block";

  // Ajout de la question utilisateur dans l'interface
  conversationHistory.push({ role: "user", content: input });
  localStorage.setItem('azizChatHistory', JSON.stringify(conversationHistory));

  const chatDiv = document.getElementById("chatHistory");
  const userMessage = document.createElement("div");
  userMessage.className = "message-block";
  userMessage.innerHTML = `<span class="user"></span><pre><code>${escapeHTML(input)}</code></pre>`;
  chatDiv.appendChild(userMessage);
  scrollToBottom();


  // Message "en cours" avec avatar qui pulse
  const pendingDiv = document.createElement("div");
  pendingDiv.className = "message-block";
  pendingDiv.innerHTML = `
    <span class="assistant">
        <img src="../images/images_chatbot/aziz-photo.png" alt="Assistant" class="assistant-photo pulse">
        <span class="assistant-label">Aziz&nbsp;:</span>
    </span>
    <div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
    <div class="reply-content"></div>
    `;

  chatDiv.appendChild(pendingDiv);
  scrollToBottom();

  controller = new AbortController();

  try {
    if (!conversationHistory || conversationHistory.length === 0) {
      alert("Erreur : aucune question n'a été envoyée au modèle.");
      return;
    }

    const res = await fetch("https://aziz-chatbot-backend.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: document.getElementById("modelSelect").value,
        messages: conversationHistory,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    const data = await res.json();
    console.log("Réponse brute du backend :", data);

    let rawReply = "❌ Erreur : contenu vide.";

    try {
      rawReply = data.choices[0].message.content;
    } catch (e) {
      console.error("Erreur d’accès au contenu :", e);
    }

    // ← mets le test ICI, maintenant rawReply a la vraie réponse
    if (rawReply.length < 120) {
      rawReply += "\n\n⚠️ Réponse courte ou incomplète. Il est possible que le modèle ait été interrompu. N'hésitez pas à poser à nouveau votre question.";
    }



    conversationHistory.push({ role: "assistant", content: rawReply });
    localStorage.setItem('azizChatHistory', JSON.stringify(conversationHistory));

    await streamBlocks(pendingDiv, rawReply, 30);

  } catch (err) {
    console.error("Erreur de requête :", err);
    if (err.name === "AbortError") {
      pendingDiv.innerHTML = `<span class="assistant"><img src="../images/images_chatbot/aziz-photo.png" alt="Aziz" class="assistant-photo"> <span class="assistant-label">Aziz&nbsp;:</span></span>⚠️ Réponse interrompue par l'utilisateur.`;
    } else {
      pendingDiv.innerHTML = `<span class="assistant"><img src="../images/images_chatbot/aziz-photo.png" alt="Aziz" class="assistant-photo"> <span class="assistant-label">Aziz&nbsp;:</span></span>❌ Erreur de réponse : ${err.message}`;

    }
  }

  controller = null;
  isWaiting = false;
  document.getElementById("sendBtn").style.display = "inline-block";
  document.getElementById("stopBtn").style.display = "none";
  document.getElementById("userInput").focus();

  scrollToBottom();
}


// Permet d'interrompre la réponse
function abortResponse() {
  if (controller) controller.abort();
}

// Scroll automatique en bas du chat
function scrollToBottom(smooth = true) {
  const chatDiv = document.getElementById("chatHistory");
  // Ne pas scroller si l'utilisateur a scrollé vers le haut
  if (window.userScrolledUp) return;
  chatDiv.scrollTo({
    top: chatDiv.scrollHeight,
    behavior: smooth ? "smooth" : "auto"
  });
}


document.getElementById("chatHistory").addEventListener('scroll', function () {
  const div = this;
  // Si on n'est pas tout à fait en bas, l'utilisateur lit le haut → on bloque l'auto-scroll
  if (div.scrollTop + div.clientHeight < div.scrollHeight - 20) {
    window.userScrolledUp = true;
  } else {
    // Il est revenu en bas → on réactive l'auto-scroll
    window.userScrolledUp = false;
  }
});




// Envoi via Entrée (sans Shift)
document.getElementById("userInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!isWaiting) sendMessage();
  }
});

// Boutons envoyer / stop
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("stopBtn").addEventListener("click", abortResponse);


window.onload = function() {
  // Afficher l'historique de la conversation
  const saved = localStorage.getItem('azizChatHistory');
  if (saved) {
    conversationHistory = JSON.parse(saved);
    for (const msg of conversationHistory) {
      const div = document.createElement("div");
      div.className = "message-block";
      if (msg.role === "user") {
        div.innerHTML = `<span class="user"></span><pre><code>${escapeHTML(msg.content)}</code></pre>`;
      } else {
        div.innerHTML = `<span class="assistant"><img src="../images/images_chatbot/aziz-photo.png" alt="Aziz" class="assistant-photo"> <b>Aziz&nbsp;:</b></span>`;
        const content = document.createElement("div");
        content.innerHTML = DOMPurify.sanitize(marked.parse(msg.content));
        div.appendChild(content);
      }

      document.getElementById("chatHistory").appendChild(div);
    }
    hljs.highlightAll();
    addCopyButtons();
    scrollToBottom();
  }
  // Afficher la description du modèle sélectionné au démarrage
  updateModelDescription();
};


// Griser le bouton envoyer si champ vide
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
sendBtn.disabled = !userInput.value.trim();

userInput.addEventListener("input", function() {
  sendBtn.disabled = !userInput.value.trim();
});



document.getElementById("themeToggleBtn").addEventListener("click", function() {
  document.body.classList.toggle('dark');
  localStorage.setItem('azizChatDarkMode', document.body.classList.contains('dark') ? 'on' : 'off');
});


document.getElementById("clearBtn").addEventListener("click", () => {
  conversationHistory = [];
  document.getElementById("chatHistory").innerHTML = '';
  document.getElementById("chatHistory").scrollTop = 0;

  localStorage.removeItem('azizChatHistory');
  userInput.value = '';
  sendBtn.disabled = true;
  userInput.focus();
});

const descriptions = {
  "meta-llama/llama-4-scout:free": "🟪 Llama 4 Scout (free) : Nouvelle génération, ultra-puissant, polyvalent et adapté aux échanges complexes. 256K tokens, 17B actifs (MoE sur 109B). Idéal pour conversations, raisonnement et prompts très longs.",
  "qwen/qwen2.5-vl-72b-instruct:free": "🟩 Qwen2.5 VL 72B Instruct (free) : Modèle texte avancé, très bon pour compréhension, raisonnement et longs contenus (131K tokens, 72B paramètres).",
  "mistralai/mistral-small-3.1-24b-instruct:free": "🟧 Mistral Small 3.1 24B (free) : Modèle rapide et polyvalent, efficace pour de nombreuses tâches textuelles avec un large contexte (96K tokens, 24B paramètres). ",
  "deepseek/deepseek-chat-v3-0324:free": "🟦 DeepSeek V3 0324 (free) : Modèle texte pur, très large contexte (164K tokens), logique avancée. 236B paramètres (MoE sur 686B). Idéal pour prompts longs, synthèse et raisonnement.",
  "qwen/qwen3-235b-a22b:free": "🟩 Qwen3 235B A22B (free) : Modèle texte massif, multilingue, expert en raisonnement et analyse fine. 41K tokens, 235B (22B actifs, architecture MoE).",
  "deepseek/deepseek-prover-v2:free": "🟦 DeepSeek Prover V2 (free) : Modèle dédié au raisonnement mathématique et logique. 164K tokens, 671B paramètres (MoE). Multilingue, idéal pour preuves formelles et calculs complexes."
};




function updateModelDescription() {
  const select = document.getElementById('modelSelect');
  const desc = descriptions[select.value] || '';
  document.getElementById('modelDescription').textContent = desc;
}

document.getElementById('modelSelect').addEventListener('change', updateModelDescription);





function addCopyButtons() {
  document.querySelectorAll('.message-block').forEach((blockMsg) => {
    if (!blockMsg.querySelector('.assistant')) return;
    blockMsg.querySelectorAll('pre code').forEach((block) => {
      if (block.parentElement.querySelector('.code-btn-group')) return;
      const btnGroup = document.createElement('div');
      btnGroup.className = 'code-btn-group';

      // Copier
      const btn = document.createElement('button');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M5 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6.828A2 2 0 0 0 12.828 6l-3.95-3.95A2 2 0 0 0 7.172 2H5zm0 1h2.172a1 1 0 0 1 .707.293l3.828 3.828A1 1 0 0 1 12 7.172V12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2.5 5a.5.5 0 0 0-1 0V9H5a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V10H11a.5.5 0 0 0 0-1H8.5V8z"/></svg>';
      btn.className = 'copy-btn';
      btn.title = "Copier le code";
      btn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(block.innerText);
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06L8 8.19l4.72-4.72a.75.75 0 0 1 1.06 0z"></path></svg>';
        setTimeout(() => {
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M5 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6.828A2 2 0 0 0 12.828 6l-3.95-3.95A2 2 0 0 0 7.172 2H5zm0 1h2.172a1 1 0 0 1 .707.293l3.828 3.828A1 1 0 0 1 12 7.172V12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2.5 5a.5.5 0 0 0-1 0V9H5a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V10H11a.5.5 0 0 0 0-1H8.5V8z"/></svg>';
        }, 1200);
      };

      // Editer
      const editBtn = document.createElement('button');
      editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M12.146 2.854a.5.5 0 0 1 0 .708l-8.292 8.292a.5.5 0 0 1-.168.11l-3 1a.5.5 0 0 1-.638-.638l1-3a.5.5 0 0 1 .11-.168l8.292-8.292a.5.5 0 0 1 .708 0l2 2zM11.207 3.5 13.5 5.793l-2 2L9.207 5.5l2-2zm1.086 1.086-2-2L2.5 9.379V11.5h2.121l8.672-8.672zm.707.707-8.672 8.672A.5.5 0 0 1 5 12.5H2.5a.5.5 0 0 1-.5-.5v-2.5a.5.5 0 0 1 .146-.354l8.672-8.672a1.5 1.5 0 0 1 2.121 2.121z"/></svg>`;

      editBtn.className = 'edit-btn';
      editBtn.title = "Modifier le code";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('userInput').value = block.innerText;
        document.getElementById('userInput').focus();
      };

      btnGroup.appendChild(btn);
      btnGroup.appendChild(editBtn);

      block.parentElement.style.position = "relative";
      block.parentElement.appendChild(btnGroup);
    });
  });
}