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
    
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Réponse backend non-JSON (HTTP ${res.status})`);
    }
    
    console.log("Réponse brute du backend :", data);
    
    if (!res.ok) {
      // Affiche l’erreur réelle du backend
      const msg = data?.error || `Erreur HTTP ${res.status}`;
      const details = data?.details ? "\n\nDétails: " + JSON.stringify(data.details, null, 2) : "";
      throw new Error(msg + details);
    }
    
    // Ici seulement, on lit choices
    const rawReply = data?.choices?.[0]?.message?.content;
    if (!rawReply) {
      throw new Error("Réponse OpenRouter invalide: aucun contenu dans choices[0].message.content");
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
  populateModelSelect();
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

const MODELS = [
  { label: "OpenAI: gpt-oss-120b (free)", id: "openai/gpt-oss-120b:free" },
  { label: "Google: Gemma 3 4B (free)", id: "google/gemma-3-4b-it:free" },
  { label: "TNG: DeepSeek R1T2 Chimera (free)", id: "tngtech/deepseek-r1t2-chimera:free" },
  { label: "Qwen: Qwen2.5-VL 7B Instruct (free)", id: "qwen/qwen-2.5-vl-7b-instruct:free" },
  { label: "Qwen: Qwen3 Next 80B A3B Instruct (free)", id: "qwen/qwen3-next-80b-a3b-instruct:free" },
  { label: "Meta: Llama 3.3 70B Instruct (free)", id: "meta-llama/llama-3.3-70b-instruct:free" },
];

const descriptions = {
  "openai/gpt-oss-120b:free": "🟦 OpenAI gpt-oss-120b (free) : gros modèle open-weight MoE, bon raisonnement, long contexte.",
  "google/gemma-3-4b-it:free": "🟩 Gemma 3 4B (free) : léger/rapide, bon assistant général, contexte ~32K.",
  "tngtech/deepseek-r1t2-chimera:free": "🟪 DeepSeek R1T2 Chimera (free) : orienté raisonnement/long contexte, selon providers.",
  "qwen/qwen-2.5-vl-7b-instruct:free": "🟨 Qwen2.5-VL 7B (free) : modèle multimodal (texte/vision selon support).",
  "qwen/qwen3-next-80b-a3b-instruct:free": "🟧 Qwen3 Next 80B (free) : instruction-tuned, stable, bon pour tâches complexes.",
  "meta-llama/llama-3.3-70b-instruct:free": "🟫 Llama 3.3 70B (free) : très bon modèle généraliste, multilingue.",
};



function updateModelDescription() {
  const select = document.getElementById('modelSelect');
  const desc = descriptions[select.value] || '';
  document.getElementById('modelDescription').textContent = desc;
}

document.getElementById('modelSelect').addEventListener('change', updateModelDescription);



function populateModelSelect() {
  const select = document.getElementById("modelSelect");
  select.innerHTML = "";

  MODELS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;        // <-- c’est CET ID qui part au backend
    opt.textContent = m.label;
    select.appendChild(opt);
  });

  // optionnel: choisir un modèle par défaut
  select.value = "mistralai/mistral-small-3.1-24b-instruct:free";
}


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
