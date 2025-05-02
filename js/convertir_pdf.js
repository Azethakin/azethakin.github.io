const uploadInput = document.getElementById('upload');
const previewSection = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

let pdfFiles = [];

uploadInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
        const pages = await getPageCount(file);
        const thumbnail = await getFirstPageThumbnail(file);
        pdfFiles.push({ file, pages, thumbnail, rotation: 0 });
    }

    updatePreview();
});

function updatePreview() {
    previewSection.innerHTML = '';

    pdfFiles.forEach((pdfObj, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';

        const img = document.createElement('img');
        img.src = pdfObj.thumbnail;
        img.className = 'preview-image';
        img.style.transform = `rotate(${pdfObj.rotation}deg)`;

        const badge = document.createElement('div');
        badge.className = 'number-badge';
        badge.innerText = index + 1;

        const toolbar = document.createElement('div');
        toolbar.className = 'image-toolbar';

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'X';
        deleteBtn.title = 'Supprimer';
        deleteBtn.addEventListener('click', () => {
            pdfFiles.splice(index, 1);
            updatePreview();
        });

        const rotateBtn = document.createElement('button');
        rotateBtn.innerHTML = '⟳';
        rotateBtn.className = 'btn-rotate';
        rotateBtn.title = 'Pivoter';
        rotateBtn.addEventListener('click', () => {
            pdfObj.rotation = (pdfObj.rotation + 90) % 360;
            updatePreview();
        });

        toolbar.appendChild(deleteBtn);
        toolbar.appendChild(rotateBtn);

        const info = document.createElement('div');
        info.className = 'image-info';
        info.innerText = `${pdfObj.file.name} - ${pdfObj.pages} page(s)`;

        wrapper.appendChild(img);
        wrapper.appendChild(badge);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(info);
        previewSection.appendChild(wrapper);
    });
}

async function getPageCount(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
}

async function getFirstPageThumbnail(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    return canvas.toDataURL('image/jpeg');
}

async function rotateCanvasIfNeeded(canvas, rotation) {
    if (!rotation) return canvas;

    const rotatedCanvas = document.createElement('canvas');
    const rotatedCtx = rotatedCanvas.getContext('2d');

    if (rotation % 180 === 0) {
        rotatedCanvas.width = canvas.width;
        rotatedCanvas.height = canvas.height;
    } else {
        rotatedCanvas.width = canvas.height;
        rotatedCanvas.height = canvas.width;
    }

    rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    rotatedCtx.rotate(rotation * Math.PI / 180);
    rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return rotatedCanvas;
}

convertBtn.addEventListener('click', async () => {
    if (pdfFiles.length === 0) {
        alert('Veuillez sélectionner des fichiers PDF.');
        return;
    }

    try {
        convertBtn.disabled = true;
        convertBtn.innerText = 'Conversion en cours...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.innerText = 'Progression : 0%';

        const outputOption = document.querySelector('input[name="outputOption"]:checked').value;
        const zip = new JSZip();
        const totalPages = pdfFiles.reduce((acc, pdf) => acc + pdf.pages, 0);
        let pagesDone = 0;

        for (const pdfObj of pdfFiles) {
            const arrayBuffer = await pdfObj.file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);

                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                const finalCanvas = await rotateCanvasIfNeeded(canvas, pdfObj.rotation);

                const imgData = finalCanvas.toDataURL('image/jpeg', 1.0);
                const baseFileName = pdfObj.file.name.replace(/\.pdf$/i, '');
                const fileName = `${baseFileName}_page_${i}.jpg`;

                if (outputOption === 'zip') {
                    zip.file(fileName, imgData.split(',')[1], { base64: true });
                } else {
                    const link = document.createElement('a');
                    link.href = imgData;
                    link.download = fileName;
                    link.click();
                }

                pagesDone++;
                const progress = Math.round((pagesDone / totalPages) * 100);
                progressBar.style.width = `${progress}%`;
                progressText.innerText = `Progression : ${progress}%`;
            }
        }

        if (outputOption === 'zip') {
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'images_converties.zip';
            link.click();
        }

    } catch (error) {
        console.error('Erreur pendant la conversion :', error);
        alert('Erreur pendant la conversion : ' + error.message);
    } finally {
        convertBtn.disabled = false;
        convertBtn.innerText = 'Convertir en Images';
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.innerText = 'Progression : 0%';
        }, 1000);
    }
});
