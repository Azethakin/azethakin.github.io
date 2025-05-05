const fileUploader = document.getElementById('fileUploader');


const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

// ✅ Ajout de l'écouteur sur le label pour forcer le clic sur l'input caché
const fileLabel = document.querySelector('label[for="fileUploader"]');
if (fileLabel && fileUploader) {
    fileLabel.addEventListener('click', (e) => {
        e.preventDefault();
        fileUploader.click();
    });
}

let pdfDoc = null;
let currentPdfBytes = null;
let currentShapeType = 'rectangle';
let shapes = [];
let drawing = false;
let startX, startY;
let pdfScale = 1.5;

let pdfForPdfJs = null;
let pdfForPdfLib = null;

let selectedShapeIndex = null;

let isDraggingShape = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isRendering = false;

let overlayCanvas;
let overlayCtx;

let drawingMode = false; // État du mode dessin activé/désactivé


// ✅ Si l'écran est large (PC), active le dessin automatiquement
if (window.innerWidth >= 768) {
    drawingMode = true;
  }
  


// 📂 Chargement du fichier PDF
fileUploader.onchange = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return alert("Veuillez charger un fichier PDF valide.");

    const reader = new FileReader();

    reader.onload = async () => {
        try {
            const arrayBuffer = reader.result;
            pdfForPdfLib = arrayBuffer.slice(0);
            const uint8Array = new Uint8Array(arrayBuffer);
            pdfForPdfJs = uint8Array;

            pdfDoc = await pdfjsLib.getDocument({ data: pdfForPdfJs }).promise;
            renderPage();
        } catch (error) {
            console.error("Erreur lors du chargement du PDF :", error);
            alert("Impossible de charger le fichier PDF. Vérifiez son format et réessayez.");
        }
    };

    reader.readAsArrayBuffer(file);
};

async function renderPage() {
    if (!pdfDoc || isRendering) return;
    isRendering = true;

    try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: pdfScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (!overlayCanvas) {
            overlayCanvas = document.createElement('canvas');
            canvas.parentNode.style.position = 'relative';
            canvas.parentNode.appendChild(overlayCanvas);
            overlayCtx = overlayCanvas.getContext('2d');
        }
        
        // Toujours synchroniser les dimensions à chaque rendu
        overlayCanvas.width = canvas.width;
        overlayCanvas.height = canvas.height;
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.left = '0';
        overlayCanvas.style.top = '0';
        overlayCanvas.style.width = canvas.style.width;
        overlayCanvas.style.height = canvas.style.height;
        overlayCanvas.style.pointerEvents = 'none';
        

        await page.render({ canvasContext: ctx, viewport }).promise;

        shapes.forEach((shape, index) => {
            const isSelected = index === selectedShapeIndex;
            drawShape(shape.startX, shape.startY, shape.endX, shape.endY, shape.type, isSelected);
        });
    } catch (error) {
        console.error("Erreur lors de l'affichage de la page :", error);
        alert("Une erreur est survenue lors de l'affichage du PDF.");
    } finally {
        isRendering = false;
    }
}




// pour mobile 

function handlePointerDown(x, y) {
    selectedShapeIndex = null;
    isDraggingShape = false;

    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        const x1 = Math.min(shape.startX, shape.endX);
        const x2 = Math.max(shape.startX, shape.endX);
        const y1 = Math.min(shape.startY, shape.endY);
        const y2 = Math.max(shape.startY, shape.endY);

        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
            selectedShapeIndex = i;
            isDraggingShape = true;
            dragOffsetX = x - x1;
            dragOffsetY = y - y1;
            drawing = false;
            document.getElementById('deleteShapeBtn').disabled = false;
            renderPage();
            return;
        }
    }

    drawing = true;
    startX = x;
    startY = y;
    selectedShapeIndex = null;
    document.getElementById('deleteShapeBtn').disabled = true;
    renderPage();
}

function handlePointerMove(x, y) {
    if (isDraggingShape && selectedShapeIndex !== null) {
        const shape = shapes[selectedShapeIndex];
        const width = Math.abs(shape.endX - shape.startX);
        const height = Math.abs(shape.endY - shape.startY);

        shape.startX = x - dragOffsetX;
        shape.startY = y - dragOffsetY;
        shape.endX = shape.startX + width;
        shape.endY = shape.startY + height;

        if (!isRendering) {
            renderPage();
        }
        return;
    }

    if (drawing) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        drawShapeOnOverlay(startX, startY, x, y, currentShapeType);
    }
}

function handlePointerUp(x, y) {
    if (isDraggingShape) {
        isDraggingShape = false;
        return;
    }

    if (drawing) {
        drawing = false;
        shapes.push({
            type: currentShapeType,
            startX,
            startY,
            endX: x,
            endY: y,
            link: ''
        });

        renderPage();
    }

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}








document.getElementById('rectangleBtn').onclick = () => currentShapeType = 'rectangle';
document.getElementById('circleBtn').onclick = () => currentShapeType = 'circle';

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect(); // taille visible à l'écran
    const scaleX = canvas.width / rect.width;   // rapport entre taille logique et physique
    const scaleY = canvas.height / rect.height;

    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}


function getTouchPos(canvas, touchEvent) {    // pour mobile
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = touchEvent.touches[0] || touchEvent.changedTouches[0];
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}



canvas.onmousedown = (e) => {
    if (!drawingMode) return;

    const { x, y } = getMousePos(canvas, e);
    handlePointerDown(x, y);

};


canvas.ontouchstart = (e) => {
    if (!drawingMode) return;

    e.preventDefault();
    const { x, y } = getTouchPos(canvas, e);
    handlePointerDown(x, y);
};


canvas.onmousemove = (e) => {
    if (!drawingMode) return;

    const { x, y } = getMousePos(canvas, e);
    handlePointerMove(x, y);


};


canvas.ontouchmove = (e) => {
    e.preventDefault();
    const { x, y } = getTouchPos(canvas, e);
    handlePointerMove(x, y);
};

canvas.ontouchend = (e) => {
    e.preventDefault();
    const { x, y } = getTouchPos(canvas, e);
    handlePointerUp(x, y);
};


canvas.onmouseup = (e) => {
    if (!drawingMode) return;

    const { x, y } = getMousePos(canvas, e);
    handlePointerUp(x, y);


};







function drawShapeOnOverlay(x1, y1, x2, y2, type) {
    overlayCtx.strokeStyle = 'red';
    overlayCtx.lineWidth = 2;

    if (type === 'rectangle') {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        overlayCtx.strokeRect(left, top, width, height);

    } else if (type === 'circle') {
        overlayCtx.beginPath();
        overlayCtx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) / 2, 0, 2 * Math.PI);
        overlayCtx.stroke();
    }
}

async function renderPageWithoutClear() {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: pdfScale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    shapes.forEach(s => drawShape(s.startX, s.startY, s.endX, s.endY, s.type));
}

function drawShape(x1, y1, x2, y2, type, isSelected = false) {
    ctx.strokeStyle = isSelected ? 'blue' : 'red';
    ctx.lineWidth = 2;

    if (type === 'rectangle') {
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        ctx.strokeRect(left, top, width, height);

    } else if (type === 'circle') {
        ctx.beginPath();
        ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

document.getElementById('addLinkBtn').onclick = () => {
    const link = document.getElementById('linkInput').value.trim();
    if (!link || shapes.length === 0) {
        return alert("Dessinez une forme et entrez un lien valide.");
    }

    shapes[shapes.length - 1].link = link.startsWith("http") ? link : "https://" + link;
    document.getElementById('linkInput').value = '';
    alert("✅ Lien ajouté !");
};

document.getElementById('downloadPdfBtn').onclick = async () => {
    if (!pdfForPdfLib) return alert("Veuillez charger un PDF avant de télécharger.");

    try {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfForPdfLib);
        const pages = pdfDoc.getPages();
        const page = pages[0];
        const { width, height } = page.getSize();

        shapes.forEach(shape => {
            if (!shape.link) return;

            const x1 = Math.min(shape.startX, shape.endX) / pdfScale;
            const x2 = Math.max(shape.startX, shape.endX) / pdfScale;
            const y1 = height - (Math.max(shape.startY, shape.endY) / pdfScale);
            const y2 = height - (Math.min(shape.startY, shape.endY) / pdfScale);

            const annotationDict = pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: [x1, y1, x2, y2],
                Border: [0, 0, 0],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    URI: PDFLib.PDFString.of(shape.link)
                }
            });

            const annotationRef = pdfDoc.context.register(annotationDict);
            const annots = page.node.Annots();

            if (annots) {
                annots.push(annotationRef);
            } else {
                page.node.set(PDFLib.PDFName.of('Annots'), pdfDoc.context.obj([annotationRef]));
            }
        });

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'CV_avec_liens.pdf';
        link.click();
    } catch (error) {
        console.error("Erreur lors de la génération du PDF :", error);
        alert("❌ Une erreur est survenue lors de la création du PDF.");
    }
};

document.getElementById('deleteShapeBtn').onclick = () => {
    if (selectedShapeIndex !== null) {
        shapes.splice(selectedShapeIndex, 1);
        selectedShapeIndex = null;
        document.getElementById('deleteShapeBtn').disabled = true;
        renderPage();
    } else {
        alert("Cliquez d'abord sur une forme à supprimer.");
    }
};

document.getElementById('toggleDrawBtn').onclick = () => {
    drawingMode = !drawingMode;

    const btn = document.getElementById('toggleDrawBtn');
    btn.textContent = drawingMode ? "🛑 Désactiver le dessin" : "🖌️ Activer le dessin";

    // Optionnel : feedback visuel
    canvas.style.cursor = drawingMode ? "crosshair" : "default";
};


// pour la fenetre information dans liens cliquable
// Ouvrir les modales selon le bouton cliqué

// MOBILE uniquement
document.getElementById("infoBtnMobile").addEventListener("click", () => {
    document.getElementById("infoModalMobile").style.display = "block";
  });
  document.querySelector(".close-mobile").addEventListener("click", () => {
    document.getElementById("infoModalMobile").style.display = "none";
  });
  
  // DESKTOP uniquement
  document.getElementById("infoBtnDesktop").addEventListener("click", () => {
    document.getElementById("infoModalDesktop").style.display = "block";
  });
  document.querySelector(".close-desktop").addEventListener("click", () => {
    document.getElementById("infoModalDesktop").style.display = "none";
  });
  
