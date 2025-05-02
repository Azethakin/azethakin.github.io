const fileUploader = document.getElementById('fileUploader');
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

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




// Chargement du fichier PDF
fileUploader.onchange = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return alert("Veuillez charger un fichier PDF valide.");

    const reader = new FileReader();


    reader.onload = async () => {
        try {
            const arrayBuffer = reader.result;
            pdfForPdfLib = arrayBuffer.slice(0); // copie indépendante pour pdf-lib
            const uint8Array = new Uint8Array(arrayBuffer); // pour pdf.js
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

// Affichage de la page PDF dans le canvas
async function renderPage() {
    if (!pdfDoc || isRendering) return;
    isRendering = true;

    try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: pdfScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

                // Créer une seule fois le overlayCanvas
        if (!overlayCanvas) {
            overlayCanvas = document.createElement('canvas');
            overlayCanvas.width = canvas.width;
            overlayCanvas.height = canvas.height;
            overlayCanvas.style.position = 'absolute';
            overlayCanvas.style.left = '0';
            overlayCanvas.style.top = '0';
            overlayCanvas.style.width = '100%';
            overlayCanvas.style.height = '100%';

            overlayCanvas.style.pointerEvents = 'none'; // permet les clics à travers
            canvas.parentNode.style.position = 'relative'; // important pour positionner absolu
            canvas.parentNode.appendChild(overlayCanvas);
            overlayCtx = overlayCanvas.getContext('2d');
        }


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


// Boutons pour sélectionner la forme
document.getElementById('rectangleBtn').onclick = () => currentShapeType = 'rectangle';
document.getElementById('circleBtn').onclick = () => currentShapeType = 'circle';

// Gestion du dessin sur le canvas
canvas.onmousedown = (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    // Vérifie si on clique sur une forme existante (en partant de la dernière vers la première)
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
            renderPage(); // pour mettre à jour le style du rectangle sélectionné (bleu)
            return;
        }
    }

    // Si aucune forme sélectionnée, commencer un nouveau dessin
    drawing = true;
    startX = x;
    startY = y;
    selectedShapeIndex = null;
    document.getElementById('deleteShapeBtn').disabled = true;
    renderPage(); // désélectionner visuellement les formes
};









canvas.onmousemove = (e) => {

    // Détection du survol d'une forme pour changer le curseur
let hovering = false;
for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    const x1 = Math.min(shape.startX, shape.endX);
    const x2 = Math.max(shape.startX, shape.endX);
    const y1 = Math.min(shape.startY, shape.endY);
    const y2 = Math.max(shape.startY, shape.endY);

    if (e.offsetX >= x1 && e.offsetX <= x2 && e.offsetY >= y1 && e.offsetY <= y2) {
        hovering = true;
        break;
    }
}
canvas.style.cursor = hovering ? 'grab' : 'default';



    const x = e.offsetX;
    const y = e.offsetY;

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
    
};


function drawShapeOnOverlay(x1, y1, x2, y2, type) {
    overlayCtx.strokeStyle = 'red';
    overlayCtx.lineWidth = 2;

    if (type === 'rectangle') {
        overlayCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (type === 'circle') {
        overlayCtx.beginPath();
        overlayCtx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) / 2, 0, 2 * Math.PI);
        overlayCtx.stroke();
    }
}




canvas.onmouseup = (e) => {
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
            endX: e.offsetX,
            endY: e.offsetY,
            link: ''
        });

        renderPage(); // redessine avec la nouvelle forme
    }

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

};



// Redessine sans effacer tout le canvas
async function renderPageWithoutClear() {
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale: pdfScale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        shapes.forEach(s => drawShape(s.startX, s.startY, s.endX, s.endY, s.type));
    });
}

// Dessine les formes sur le canvas
function drawShape(x1, y1, x2, y2, type, isSelected = false) {
    ctx.strokeStyle = isSelected ? 'blue' : 'red';
    ctx.lineWidth = 2;

    if (type === 'rectangle') {
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (type === 'circle') {
        ctx.beginPath();
        ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
}


// Ajout d'un lien à la dernière zone sélectionnée
document.getElementById('addLinkBtn').onclick = () => {
    const link = document.getElementById('linkInput').value.trim();
    if (!link || shapes.length === 0) {
        return alert("Dessinez une forme et entrez un lien valide.");
    }

    shapes[shapes.length - 1].link = link.startsWith("http") ? link : "https://" + link;
    document.getElementById('linkInput').value = '';
    alert("✅ Lien ajouté !");
};

// Téléchargement du PDF modifié
document.getElementById('downloadPdfBtn').onclick = async () => {
    if (!pdfForPdfLib) return alert("Veuillez charger un PDF avant de télécharger.");


    try {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfForPdfLib);


        const pages = pdfDoc.getPages();
        const page = pages[0];

        const { width, height } = page.getSize();

        shapes.forEach(shape => {
            if (!shape.link) return;

            // Conversion des coordonnées canvas vers PDF
            const x1 = Math.min(shape.startX, shape.endX) / pdfScale;
            const x2 = Math.max(shape.startX, shape.endX) / pdfScale;
            const y1 = height - (Math.max(shape.startY, shape.endY) / pdfScale);
            const y2 = height - (Math.min(shape.startY, shape.endY) / pdfScale);

            // Création de l'annotation de lien
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