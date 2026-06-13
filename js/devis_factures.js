const state = {
  logoDataUrl: "",
  items: []
};

const $ = (id) => document.getElementById(id);

const fields = [
  "documentNumber",
  "documentDate",
  "companyName",
  "companyOwner",
  "companySiret",
  "companyAddress",
  "companyEmail",
  "companyPhone",
  "clientName",
  "clientAddress",
  "clientEmail",
  "clientPhone",
  "workAddress",
  "discount",
  "deposit",
  "paymentTitle",
  "paymentDelay",
  "notesTitle",
  "notes",
  "customFooterText",
  "vatFranchise",
  "showLateFees",
  "showSignature",
  "globalTextSize",
  "headerTextSize",
  "partyTextSize",
  "tableTextSize",
  "notesTextSize",
  "totalsTextSize"
];

document.addEventListener("DOMContentLoaded", () => {
  setTodayDate();
  addItem();
  bindEvents();
  updatePreview();
});

function bindEvents() {
  fields.forEach((id) => {
    const element = $(id);

    if (!element) return;

    element.addEventListener("input", updatePreview);
    element.addEventListener("change", updatePreview);
  });

  document.querySelectorAll("input[name='documentType']").forEach((radio) => {
    radio.addEventListener("change", () => {
      updateChoiceStyle();
      updateDocumentNumberPlaceholder();
      updatePreview();
    });
  });


  $("addItemBtn").addEventListener("click", () => {
    addItem();
  });

  $("downloadBtn").addEventListener("click", downloadPdf);
  $("exampleBtn").addEventListener("click", openExampleModal);
  $("closeExampleModal").addEventListener("click", closeExampleModal);
  $("resetBtn").addEventListener("click", resetForm);

  $("compactModeBtn").addEventListener("click", setCompactMode);
  $("normalSizeBtn").addEventListener("click", setNormalTextSize);

  $("companyLogo").addEventListener("change", handleLogoUpload);

  document.querySelectorAll("[data-payment-text]").forEach((button) => {
    button.addEventListener("click", () => {
        $("paymentDelay").value = button.dataset.paymentText;
        updatePreview();
    });
  });

  document.querySelectorAll("[data-footer-format]").forEach((button) => {
    button.addEventListener("click", () => {
        applyFooterFormat(button.dataset.footerFormat);
    });
  });

  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
        fillExample(button.dataset.example);
        closeExampleModal();
    });
    });

    $("exampleModal").addEventListener("click", (event) => {
    if (event.target.id === "exampleModal") {
        closeExampleModal();
    }
  });

  $("removeLogoBtn").addEventListener("click", removeLogo);
}

function setTodayDate() {
  const today = new Date();
  const isoDate = today.toISOString().split("T")[0];
  $("documentDate").value = isoDate;
}

function updateChoiceStyle() {
  document.querySelectorAll(".choice").forEach((choice) => {
    const input = choice.querySelector("input");
    choice.classList.toggle("active", input.checked);
  });
}

function getDocumentType() {
  return document.querySelector("input[name='documentType']:checked").value;
}

function updateDocumentNumberPlaceholder() {
  const type = getDocumentType();

  if (type === "Devis") {
    $("documentNumber").placeholder = "Ex : DEV-2026-001";
  } else {
    $("documentNumber").placeholder = "Ex : FAC-2026-001";
  }
}

function addItem(data = {}) {
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: data.title || "Nouvelle prestation",
    subItems: data.subItems || [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + "-sub"),
        description: "",
        quantity: 1,
        unit: "unité",
        price: 0,
        vat: 20
      }
    ]
  };

  state.items.push(item);
  renderItems();
  updatePreview();
}

function addSubItem(itemId) {
  const item = state.items.find((item) => item.id === itemId);

  if (!item) return;

  item.subItems.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    description: "",
    quantity: 1,
    unit: "unité",
    price: 0,
    vat: 20
  });

  renderItems();
  updatePreview();
}

function removeSubItem(itemId, subItemId) {
  const item = state.items.find((item) => item.id === itemId);

  if (!item) return;

  if (item.subItems.length === 1) {
    alert("Vous devez garder au moins un détail dans cette prestation.");
    return;
  }

  item.subItems = item.subItems.filter((subItem) => subItem.id !== subItemId);

  renderItems();
  updatePreview();
}

function updateSubItem(itemId, subItemId, key, value) {
  const item = state.items.find((item) => item.id === itemId);

  if (!item) return;

  const subItem = item.subItems.find((subItem) => subItem.id === subItemId);

  if (!subItem) return;

  if (key === "quantity" || key === "price" || key === "vat") {
    subItem[key] = Number(value) || 0;
  } else {
    subItem[key] = value;
  }

  updatePreview();
}

function removeItem(id) {
  if (state.items.length === 1) {
    alert("Vous devez garder au moins une ligne.");
    return;
  }

  state.items = state.items.filter((item) => item.id !== id);
  renderItems();
  updatePreview();
}

function updateItem(id, key, value) {
  const item = state.items.find((item) => item.id === id);

  if (!item) return;

  item[key] = value;

  updatePreview();
}

function renderItems() {
  const container = $("itemsContainer");
  container.innerHTML = "";

  state.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item-row";

    const subItemsHtml = item.subItems.map((subItem) => {
      return `
        <div class="subitem-grid">
          <div class="field">
            <label>Détail</label>
            <input 
              type="text" 
              value="${escapeHtml(subItem.description || "")}" 
              placeholder="Ex : Application d’enduit"
              data-item-id="${item.id}"
              data-subitem-id="${subItem.id}"
              data-subitem-key="description"
            />
          </div>

          <div class="field">
            <label>Qté</label>
            <input 
              type="number" 
              value="${subItem.quantity}" 
              min="0" 
              step="0.01"
              data-item-id="${item.id}"
              data-subitem-id="${subItem.id}"
              data-subitem-key="quantity"
            />
          </div>

          <div class="field">
            <label>Unité</label>
            <input 
              type="text" 
              value="${escapeHtml(subItem.unit || "unité")}" 
              placeholder="m², h, unité"
              data-item-id="${item.id}"
              data-subitem-id="${subItem.id}"
              data-subitem-key="unit"
            />
          </div>

          <div class="field">
            <label>Prix HT</label>
            <input 
              type="number" 
              value="${subItem.price}" 
              min="0" 
              step="0.01"
              data-item-id="${item.id}"
              data-subitem-id="${subItem.id}"
              data-subitem-key="price"
            />
          </div>

          <div class="field">
            <label>TVA %</label>
            <input 
              type="number" 
              value="${subItem.vat}" 
              min="0" 
              step="0.01"
              data-item-id="${item.id}"
              data-subitem-id="${subItem.id}"
              data-subitem-key="vat"
            />
          </div>

          <button 
            class="btn delete" 
            type="button" 
            data-remove-subitem="${subItem.id}"
            data-item-id="${item.id}"
          >
            Supprimer
          </button>
        </div>
      `;
    }).join("");

    row.innerHTML = `
      <div class="item-group-header">
        <div class="field">
            <label>Titre du groupe</label>
            <textarea
                rows="2"
                placeholder="Ex : Travaux de maçonnerie"
                data-key="title"
                data-id="${item.id}"
            >${escapeHtml(item.title || "")}</textarea>
        </div>

        <button class="btn delete" type="button" data-delete="${item.id}">
          Supprimer le groupe
        </button>
      </div>

      <div class="subitems-container">
        ${subItemsHtml}
      </div>

      <button class="btn small ghost" type="button" data-add-subitem="${item.id}">
        + Ajouter un détail
      </button>
    `;

    container.appendChild(row);
  });

  container.querySelectorAll("[data-key]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const id = event.target.dataset.id;
      const key = event.target.dataset.key;
      const value = event.target.value;

      updateItem(id, key, value);
    });
  });

  container.querySelectorAll("[data-subitem-key]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const itemId = event.target.dataset.itemId;
      const subItemId = event.target.dataset.subitemId;
      const key = event.target.dataset.subitemKey;
      const value = event.target.value;

      updateSubItem(itemId, subItemId, key, value);
    });
  });

  container.querySelectorAll("[data-add-subitem]").forEach((button) => {
    button.addEventListener("click", () => {
      addSubItem(button.dataset.addSubitem);
    });
  });

  container.querySelectorAll("[data-remove-subitem]").forEach((button) => {
    button.addEventListener("click", () => {
      removeSubItem(button.dataset.itemId, button.dataset.removeSubitem);
    });
  });

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      removeItem(button.dataset.delete);
    });
  });
}

function handleLogoUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    state.logoDataUrl = "";
    updatePreview();
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    state.logoDataUrl = reader.result;
    updatePreview();
  };

  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logoDataUrl = "";
  $("companyLogo").value = "";
  $("previewLogo").src = "";
  $("previewLogo").classList.add("hidden");
  $("removeLogoBtn").classList.add("hidden");

  updatePreview();
}

function updatePreview() {
  updateTextSizes();
  const documentType = getDocumentType();
  const documentNumber = $("documentNumber").value || getDefaultDocumentNumber(documentType);
  const documentDate = formatDate($("documentDate").value);

  const companyName = $("companyName").value || "Nom de l’entreprise";
  const companyOwner = $("companyOwner").value || "";
  const companySiret = $("companySiret").value || "";
  const companyAddress = $("companyAddress").value || "Adresse de l’entreprise";
  const companyEmail = $("companyEmail").value || "";
  const companyPhone = $("companyPhone").value || "";

  const clientName = $("clientName").value || "Nom du client";
  const clientAddress = $("clientAddress").value || "Adresse du client";
  const clientEmail = $("clientEmail").value || "";
  const clientPhone = $("clientPhone").value || "";

  const workAddress = $("workAddress").value.trim();
  const paymentTitle = $("paymentTitle").value.trim();
  const paymentDelay = $("paymentDelay").value.trim();
  const notesTitle = $("notesTitle").value.trim();
  const notes = $("notes").value.trim();
  const customFooterText = $("customFooterText").value || "";

  const discount = Number($("discount").value) || 0;
  const deposit = Number($("deposit").value) || 0;

  $("previewDocumentType").textContent = documentType.toUpperCase();
  $("previewDocumentNumber").textContent = `N° ${documentNumber}`;
  $("previewDocumentDate").textContent = `Date : ${documentDate}`;

  $("previewCompanyName").textContent = companyName;

  $("previewCompanyInfo").innerHTML = `
    ${nl2br(companyAddress)}<br>
    ${joinContact(companyEmail, companyPhone)}<br>
    ${companySiret ? "SIRET : " + escapeHtml(companySiret) : ""}
  `;

  $("previewEmitter").innerHTML = `
    <strong>${escapeHtml(companyName)}</strong><br>
    ${companyOwner ? escapeHtml(companyOwner) + "<br>" : ""}
    ${nl2br(companyAddress)}<br>
    ${joinContact(companyEmail, companyPhone)}<br>
    ${companySiret ? "SIRET : " + escapeHtml(companySiret) : ""}
  `;

  $("previewClient").innerHTML = `
    <strong>${escapeHtml(clientName)}</strong><br>
    ${nl2br(clientAddress)}<br>
    ${joinContact(clientEmail, clientPhone)}
  `;

  if (workAddress) {
    $("previewWorkAddressBlock").classList.remove("hidden");
    $("previewWorkAddress").innerHTML = nl2br(workAddress);
  } else {
    $("previewWorkAddressBlock").classList.add("hidden");
  }

  if (state.logoDataUrl) {
    $("previewLogo").src = state.logoDataUrl;
    $("previewLogo").classList.remove("hidden");
    $("removeLogoBtn").classList.remove("hidden");
  } else {
    $("previewLogo").src = "";
    $("previewLogo").classList.add("hidden");
    $("removeLogoBtn").classList.add("hidden");
  }

  renderPreviewItems();

  const totals = calculateTotals();

  $("previewTotalHT").textContent = formatMoney(totals.totalHT);
  $("previewTotalVAT").textContent = formatMoney(totals.totalVAT);
  $("previewDiscount").textContent = formatMoney(discount);
  $("previewTotalTTC").textContent = formatMoney(totals.totalTTC);
  $("previewDeposit").textContent = formatMoney(deposit);
  $("previewNet").textContent = formatMoney(totals.netToPay);

  $("previewNotesTitle").textContent = notesTitle || "Notes";
  $("previewNotes").innerHTML = notes ? nl2br(notes) : "Aucune note particulière.";
  
  const paymentInfo = document.querySelector(".payment-info");

    if (paymentTitle || paymentDelay) {
    paymentInfo.classList.remove("hidden");

    if (paymentTitle && paymentDelay) {
        $("previewPaymentTitle").textContent = `${paymentTitle} :`;
        $("previewPaymentDelay").innerHTML = nl2br(paymentDelay);
    } else if (paymentTitle && !paymentDelay) {
        $("previewPaymentTitle").textContent = paymentTitle;
        $("previewPaymentDelay").innerHTML = "";
    } else {
        $("previewPaymentTitle").textContent = "";
        $("previewPaymentDelay").innerHTML = nl2br(paymentDelay);
    }
    } else {
    paymentInfo.classList.add("hidden");
    $("previewPaymentTitle").textContent = "";
    $("previewPaymentDelay").innerHTML = "";
  }

  updateCustomFooter(customFooterText);

  $("previewVatFranchise").classList.toggle("hidden", !$("vatFranchise").checked);
  $("previewLateFees").classList.toggle("hidden", !$("showLateFees").checked);
  $("signatureBlock").classList.toggle("hidden", !$("showSignature").checked);
}

function renderPreviewItems() {
  const tbody = $("previewItems");
  tbody.innerHTML = "";

  state.items.forEach((item) => {
    const groupRow = document.createElement("tr");
    groupRow.className = "group-row";

    groupRow.innerHTML = `
        <td colspan="6">
            <strong>${nl2br(item.title || "Prestation")}</strong>
        </td>
    `;

    tbody.appendChild(groupRow);

    item.subItems.forEach((subItem) => {
      const lineHT = subItem.quantity * subItem.price;

      const tr = document.createElement("tr");
      tr.className = "subitem-row-preview";

      tr.innerHTML = `
        <td class="subitem-description-preview">
          - ${escapeHtml(subItem.description || "Détail")}
        </td>
        <td>${formatNumber(subItem.quantity)}</td>
        <td>${escapeHtml(subItem.unit || "unité")}</td>
        <td>${formatMoney(subItem.price)}</td>
        <td>${formatNumber(subItem.vat)} %</td>
        <td>${formatMoney(lineHT)}</td>
      `;

      tbody.appendChild(tr);
    });
  });
}

function calculateTotals() {
  const vatFranchise = $("vatFranchise").checked;
  const discount = Number($("discount").value) || 0;
  const deposit = Number($("deposit").value) || 0;

  let totalHT = 0;
  let totalVAT = 0;

  state.items.forEach((item) => {
    item.subItems.forEach((subItem) => {
      const lineHT = subItem.quantity * subItem.price;
      const lineVAT = vatFranchise ? 0 : lineHT * (subItem.vat / 100);

      totalHT += lineHT;
      totalVAT += lineVAT;
    });
  });

  const totalBeforeDiscount = totalHT + totalVAT;
  const totalTTC = Math.max(totalBeforeDiscount - discount, 0);
  const netToPay = Math.max(totalTTC - deposit, 0);

  return {
    totalHT,
    totalVAT,
    totalTTC,
    netToPay
  };
}

function downloadPdf() {
  updatePreview();

  if (typeof html2pdf === "undefined") {
    alert("La librairie PDF n'est pas chargée.");
    return;
  }

  const documentType = getDocumentType();
  const number = $("documentNumber").value || getDefaultDocumentNumber(documentType);

  const element = $("pdfDocument");
  const wrapper = document.querySelector(".pdf-wrapper");

  if (wrapper) {
    wrapper.scrollTop = 0;
    wrapper.scrollLeft = 0;
  }

  const oldBodyOverflow = document.body.style.overflow;
  const oldElementTransform = element.style.transform;
  const oldElementMargin = element.style.margin;
  const oldElementBoxShadow = element.style.boxShadow;

  document.body.style.overflow = "visible";
  element.style.transform = "none";
  element.style.margin = "0";
  element.style.boxShadow = "none";

  const options = {
    margin: 0,
    filename: `${documentType}-${number}.pdf`.replaceAll(" ", "-"),
    image: {
      type: "jpeg",
      quality: 0.98
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: {
      unit: "px",
      format: [794, 1123],
      orientation: "portrait"
    }
  };

  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      document.body.style.overflow = oldBodyOverflow;
      element.style.transform = oldElementTransform;
      element.style.margin = oldElementMargin;
      element.style.boxShadow = oldElementBoxShadow;
    })
    .catch((error) => {
      console.error(error);
      alert("Erreur pendant la génération du PDF.");

      document.body.style.overflow = oldBodyOverflow;
      element.style.transform = oldElementTransform;
      element.style.margin = oldElementMargin;
      element.style.boxShadow = oldElementBoxShadow;
    });
}


function openExampleModal() {
  $("exampleModal").classList.remove("hidden");
}

function closeExampleModal() {
  $("exampleModal").classList.add("hidden");
}

function fillExample(type = "peinture") {
  document.querySelector("input[name='documentType'][value='Devis']").checked = true;
  updateChoiceStyle();

  $("documentNumber").value = "DEV-2026-001";
  $("companyName").value = "Entreprise Exemple Pro";
  $("companyOwner").value = "Amar Benali";
  $("companySiret").value = "928 730 878 00016";
  $("companyAddress").value = "9 rue Neuve Sainte Catherine\n13007 Marseille";
  $("companyEmail").value = "contact@entreprisepro.fr";
  $("companyPhone").value = "06 18 75 39 24";

  $("clientName").value = "Avenir Immo";
  $("clientAddress").value = "16 rue Francis de Pressensé\n13001 Marseille";
  $("clientEmail").value = "client@email.com";
  $("clientPhone").value = "04 00 00 00 00";

  $("workAddress").value = "16 rue Francis de Pressensé\n13001 Marseille";

  $("discount").value = "0";
  $("deposit").value = "0";
  $("paymentTitle").value = "Conditions de paiement";
  $("paymentDelay").value = "Paiement à réception";
  $("notesTitle").value = "Notes";
  $("notes").value = "Devis valable 30 jours. Merci pour votre confiance.";

  $("vatFranchise").checked = true;
  $("showLateFees").checked = true;
  $("showSignature").checked = false;
  $("customFooterText").value = "";

  const examples = {
    peinture: {
      companyName: "Peinture Pro Service",
      items: [
        {
          id: "item-peinture-1",
          title: "Travaux de préparation",
          subItems: [
            { id: "sub-p-1", description: "Protection des sols et meubles", quantity: 1, unit: "forfait", price: 60, vat: 0 },
            { id: "sub-p-2", description: "Grattage des murs et plafonds", quantity: 1, unit: "forfait", price: 120, vat: 0 },
            { id: "sub-p-3", description: "Application d’enduit", quantity: 1, unit: "forfait", price: 90, vat: 0 },
            { id: "sub-p-4", description: "Ponçage complet des surfaces", quantity: 1, unit: "forfait", price: 70, vat: 0 }
          ]
        },
        {
          id: "item-peinture-2",
          title: "Travaux de peinture",
          subItems: [
            { id: "sub-p-5", description: "Application d’une couche d’impression", quantity: 1, unit: "forfait", price: 140, vat: 0 },
            { id: "sub-p-6", description: "Application de deux couches de peinture finition", quantity: 1, unit: "forfait", price: 180, vat: 0 }
          ]
        }
      ]
    },

    maconnerie: {
      companyName: "Maçonnerie Générale Pro",
      items: [
        {
          id: "item-mac-1",
          title: "Travaux de maçonnerie",
          subItems: [
            { id: "sub-mac-1", description: "Préparation et nettoyage de la zone d’intervention", quantity: 1, unit: "forfait", price: 120, vat: 0 },
            { id: "sub-mac-2", description: "Démolition partielle et évacuation des gravats", quantity: 1, unit: "forfait", price: 280, vat: 0 },
            { id: "sub-mac-3", description: "Montage mur en parpaings", quantity: 12, unit: "m²", price: 65, vat: 0 },
            { id: "sub-mac-4", description: "Réalisation enduit de finition", quantity: 12, unit: "m²", price: 28, vat: 0 }
          ]
        }
      ]
    },

    renovation: {
      companyName: "Rénovation Bâtiment Service",
      items: [
        {
          id: "item-reno-1",
          title: "Rénovation intérieure",
          subItems: [
            { id: "sub-r-1", description: "Dépose des anciens revêtements", quantity: 1, unit: "forfait", price: 250, vat: 0 },
            { id: "sub-r-2", description: "Reprise des murs et petites réparations", quantity: 1, unit: "forfait", price: 380, vat: 0 },
            { id: "sub-r-3", description: "Pose de plaques de plâtre", quantity: 20, unit: "m²", price: 42, vat: 0 },
            { id: "sub-r-4", description: "Pose revêtement de sol", quantity: 25, unit: "m²", price: 35, vat: 0 }
          ]
        },
        {
          id: "item-reno-2",
          title: "Finitions",
          subItems: [
            { id: "sub-r-5", description: "Application peinture finition", quantity: 1, unit: "forfait", price: 450, vat: 0 },
            { id: "sub-r-6", description: "Nettoyage de fin de chantier", quantity: 1, unit: "forfait", price: 120, vat: 0 }
          ]
        }
      ]
    },

    plomberie: {
      companyName: "Plomberie Service Pro",
      items: [
        {
          id: "item-plomb-1",
          title: "Intervention plomberie",
          subItems: [
            { id: "sub-pl-1", description: "Recherche de fuite", quantity: 1, unit: "forfait", price: 90, vat: 0 },
            { id: "sub-pl-2", description: "Remplacement robinet d’arrêt", quantity: 1, unit: "unité", price: 75, vat: 0 },
            { id: "sub-pl-3", description: "Remplacement flexible et raccords", quantity: 1, unit: "forfait", price: 55, vat: 0 },
            { id: "sub-pl-4", description: "Test d’étanchéité et remise en service", quantity: 1, unit: "forfait", price: 45, vat: 0 }
          ]
        }
      ]
    },

    electricien_batiment: {
      companyName: "Électricité Bâtiment Pro",
      items: [
        {
          id: "item-elec-bat-1",
          title: "Travaux électriques bâtiment",
          subItems: [
            { id: "sub-eb-1", description: "Diagnostic de l’installation électrique", quantity: 1, unit: "forfait", price: 120, vat: 0 },
            { id: "sub-eb-2", description: "Pose de prises électriques", quantity: 6, unit: "unité", price: 45, vat: 0 },
            { id: "sub-eb-3", description: "Pose interrupteurs", quantity: 4, unit: "unité", price: 38, vat: 0 },
            { id: "sub-eb-4", description: "Mise en conformité tableau électrique", quantity: 1, unit: "forfait", price: 420, vat: 0 }
          ]
        }
      ]
    },

    electricien_auto: {
      companyName: "Électricité Auto Service",
      items: [
        {
          id: "item-elec-auto-1",
          title: "Diagnostic électrique automobile",
          subItems: [
            { id: "sub-ea-1", description: "Diagnostic batterie et alternateur", quantity: 1, unit: "forfait", price: 60, vat: 0 },
            { id: "sub-ea-2", description: "Recherche panne faisceau électrique", quantity: 1, unit: "forfait", price: 120, vat: 0 },
            { id: "sub-ea-3", description: "Réparation connexion ou câble défectueux", quantity: 1, unit: "forfait", price: 85, vat: 0 },
            { id: "sub-ea-4", description: "Essai et vérification finale", quantity: 1, unit: "forfait", price: 35, vat: 0 }
          ]
        }
      ]
    },

    jardinage: {
      companyName: "Jardinage Espaces Verts",
      items: [
        {
          id: "item-jard-1",
          title: "Entretien espaces verts",
          subItems: [
            { id: "sub-j-1", description: "Tonte pelouse", quantity: 120, unit: "m²", price: 1.2, vat: 0 },
            { id: "sub-j-2", description: "Taille de haies", quantity: 15, unit: "ml", price: 8, vat: 0 },
            { id: "sub-j-3", description: "Désherbage et nettoyage", quantity: 1, unit: "forfait", price: 90, vat: 0 },
            { id: "sub-j-4", description: "Évacuation déchets verts", quantity: 1, unit: "forfait", price: 60, vat: 0 }
          ]
        }
      ]
    },

    electronicien: {
      companyName: "Électronique Réparation Service",
      items: [
        {
          id: "item-electro-1",
          title: "Réparation électronique",
          subItems: [
            { id: "sub-el-1", description: "Diagnostic carte électronique", quantity: 1, unit: "forfait", price: 70, vat: 0 },
            { id: "sub-el-2", description: "Remplacement composants défectueux", quantity: 1, unit: "forfait", price: 95, vat: 0 },
            { id: "sub-el-3", description: "Soudure et reprise connectique", quantity: 1, unit: "forfait", price: 55, vat: 0 },
            { id: "sub-el-4", description: "Tests de fonctionnement", quantity: 1, unit: "forfait", price: 40, vat: 0 }
          ]
        }
      ]
    },

    nettoyage: {
      companyName: "Nettoyage Pro Service",
      items: [
        {
          id: "item-net-1",
          title: "Prestation de nettoyage",
          subItems: [
            { id: "sub-n-1", description: "Nettoyage sols", quantity: 80, unit: "m²", price: 2.5, vat: 0 },
            { id: "sub-n-2", description: "Nettoyage vitres", quantity: 12, unit: "unité", price: 8, vat: 0 },
            { id: "sub-n-3", description: "Dépoussiérage mobilier", quantity: 1, unit: "forfait", price: 60, vat: 0 },
            { id: "sub-n-4", description: "Désinfection surfaces", quantity: 1, unit: "forfait", price: 75, vat: 0 }
          ]
        }
      ]
    },

    informatique: {
      companyName: "Assistance Informatique Pro",
      items: [
        {
          id: "item-info-1",
          title: "Prestation informatique",
          subItems: [
            { id: "sub-i-1", description: "Diagnostic ordinateur", quantity: 1, unit: "forfait", price: 50, vat: 0 },
            { id: "sub-i-2", description: "Installation système et logiciels", quantity: 1, unit: "forfait", price: 90, vat: 0 },
            { id: "sub-i-3", description: "Sauvegarde et transfert de données", quantity: 1, unit: "forfait", price: 70, vat: 0 },
            { id: "sub-i-4", description: "Configuration imprimante et réseau", quantity: 1, unit: "forfait", price: 55, vat: 0 }
          ]
        }
      ]
    }
  };

  const selected = examples[type] || examples.peinture;

  $("companyName").value = selected.companyName;
  state.items = selected.items;

  renderItems();
  updatePreview();
}

function resetForm() {
  const confirmed = confirm("Voulez-vous vraiment réinitialiser le formulaire ?");

  if (!confirmed) return;

  document.querySelectorAll("input, textarea").forEach((input) => {
    if (input.type === "radio") return;
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  document.querySelector("input[name='documentType'][value='Devis']").checked = true;
  $("discount").value = "0";
  $("deposit").value = "0";
  $("showLateFees").checked = true;
  $("showSignature").checked = false;
  $("paymentTitle").value = "Conditions de paiement";
  $("paymentDelay").value = "Paiement à réception";
  $("notesTitle").value = "Notes";
  $("customFooterText").value = "";

  state.logoDataUrl = "";
  $("companyLogo").value = "";
  $("removeLogoBtn").classList.add("hidden");
  state.items = [];



  setTodayDate();
  addItem();
  updateChoiceStyle();
  setNormalTextSize();
  updatePreview();
}

function getDefaultDocumentNumber(type) {
  const year = new Date().getFullYear();

  if (type === "Facture") {
    return `FAC-${year}-001`;
  }

  return `DEV-${year}-001`;
}

function formatDate(dateString) {
  if (!dateString) return "--/--/----";

  const date = new Date(dateString);

  return date.toLocaleDateString("fr-FR");
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2
  }).format(value || 0);
}

function joinContact(email, phone) {
  const parts = [];

  if (email) parts.push(escapeHtml(email));
  if (phone) parts.push(escapeHtml(phone));

  return parts.length ? parts.join(" · ") : "Contact non renseigné";
}

function nl2br(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateTextSizes() {
  const pdf = $("pdfDocument");

  if (!pdf) return;

  const globalSize = Number($("globalTextSize")?.value || 100);
  const headerSize = Number($("headerTextSize")?.value || 100);
  const partySize = Number($("partyTextSize")?.value || 100);
  const tableSize = Number($("tableTextSize")?.value || 100);
  const notesSize = Number($("notesTextSize")?.value || 100);
  const totalsSize = Number($("totalsTextSize")?.value || 100);

  pdf.style.setProperty("--global-multiplier", globalSize / 100);
  pdf.style.setProperty("--header-multiplier", headerSize / 100);
  pdf.style.setProperty("--party-multiplier", partySize / 100);
  pdf.style.setProperty("--table-multiplier", tableSize / 100);
  pdf.style.setProperty("--notes-multiplier", notesSize / 100);
  pdf.style.setProperty("--totals-multiplier", totalsSize / 100);

  updateSizeLabels({
    globalSize,
    headerSize,
    partySize,
    tableSize,
    notesSize,
    totalsSize
  });
}

function updateSizeLabels(sizes) {
  if ($("globalSizeValue")) $("globalSizeValue").textContent = `${sizes.globalSize}%`;
  if ($("headerSizeValue")) $("headerSizeValue").textContent = `${sizes.headerSize}%`;
  if ($("partySizeValue")) $("partySizeValue").textContent = `${sizes.partySize}%`;
  if ($("tableSizeValue")) $("tableSizeValue").textContent = `${sizes.tableSize}%`;
  if ($("notesSizeValue")) $("notesSizeValue").textContent = `${sizes.notesSize}%`;
  if ($("totalsSizeValue")) $("totalsSizeValue").textContent = `${sizes.totalsSize}%`;
}

function setCompactMode() {
  $("globalTextSize").value = 90;
  $("headerTextSize").value = 85;
  $("partyTextSize").value = 85;
  $("tableTextSize").value = 75;
  $("notesTextSize").value = 80;
  $("totalsTextSize").value = 85;

  updatePreview();
}

function setNormalTextSize() {
  $("globalTextSize").value = 100;
  $("headerTextSize").value = 100;
  $("partyTextSize").value = 100;
  $("tableTextSize").value = 100;
  $("notesTextSize").value = 100;
  $("totalsTextSize").value = 100;

  updatePreview();
}



function updateCustomFooter(text) {
  const footer = $("previewCustomFooter");

  if (!footer) return;

  if (!text.trim()) {
    footer.innerHTML = "";
    footer.classList.add("hidden");
    return;
  }

  footer.innerHTML = formatFooterText(text);
  footer.classList.remove("hidden");
}

function formatFooterText(text) {
  const lines = text.split("\n");

  return lines
    .map((line) => {
      let escaped = escapeHtml(line);

      if (!escaped.trim()) {
        return "<br>";
      }

      escaped = breakLongWords(escaped, 55);
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      if (/^\s*-\s+/.test(escaped)) {
        return `<div class="footer-line footer-dash">${escaped}</div>`;
      }

      if (/^\s*•\s+/.test(escaped)) {
        return `<div class="footer-line footer-bullet">${escaped}</div>`;
      }

      if (/^\s*\d+\.\s+/.test(escaped)) {
        return `<div class="footer-line footer-number">${escaped}</div>`;
      }

      return `<div class="footer-line">${escaped}</div>`;
    })
    .join("");
}

function breakLongWords(text, maxLength = 55) {
  return text.replace(/\S{55,}/g, (word) => {
    const chunks = [];

    for (let i = 0; i < word.length; i += maxLength) {
      chunks.push(word.slice(i, i + maxLength));
    }

    return chunks.join("<wbr>");
  });
}

function applyFooterFormat(type) {
  const textarea = $("customFooterText");

  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);

  let replacement = selectedText;

  if (type === "bold") {
    replacement = selectedText
      ? `**${selectedText}**`
      : "**Texte en gras**";
  }

  if (type === "normal") {
    replacement = selectedText
      .replaceAll("**", "")
      .replace(/^\s*[-•]\s*/gm, "")
      .replace(/^\s*\d+\.\s*/gm, "");
  }

  if (type === "dash") {
    replacement = selectedText
      ? selectedText.split("\n").map((line) => line.trim() ? `- ${line.replace(/^\s*[-•]\s*/, "").replace(/^\s*\d+\.\s*/, "")}` : "").join("\n")
      : "- ";
  }

  if (type === "bullet") {
    replacement = selectedText
      ? selectedText.split("\n").map((line) => line.trim() ? `• ${line.replace(/^\s*[-•]\s*/, "").replace(/^\s*\d+\.\s*/, "")}` : "").join("\n")
      : "• ";
  }

  if (type === "number") {
    replacement = selectedText
      ? selectedText.split("\n").map((line, index) => line.trim() ? `${index + 1}. ${line.replace(/^\s*[-•]\s*/, "").replace(/^\s*\d+\.\s*/, "")}` : "").join("\n")
      : "1. ";
  }

  textarea.value = before + replacement + after;
  textarea.focus();
  textarea.selectionStart = start;
  textarea.selectionEnd = start + replacement.length;

  updatePreview();
}