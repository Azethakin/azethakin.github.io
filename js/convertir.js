const uploadInput = document.getElementById('upload');
const previewSection = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');

let images = []; // Liste { file, url, rotation }

uploadInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);

    newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        images.push({ file, url, rotation: 0 }); // rotation en degrés
    });

    updatePreview();
});

function updatePreview() {
    previewSection.innerHTML = '';

    images.forEach((imgObj, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';
        wrapper.draggable = true;

        const img = document.createElement('img');
        img.src = imgObj.url;
        img.className = 'preview-image';
        img.style.transform = `rotate(${imgObj.rotation}deg)`;

        const badge = document.createElement('div');
        badge.className = 'number-badge';
        badge.innerText = index + 1;

        const toolbar = document.createElement('div');
        toolbar.className = 'image-toolbar';

        const info = document.createElement('div');
        info.className = 'image-info';
        info.innerText = '';

        // Charger l'image pour obtenir dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
            const sizeKB = Math.round(imgObj.file.size / 1024);
            info.innerText = `${sizeKB} KB - ${tempImg.width}×${tempImg.height}`;
        };
        tempImg.src = imgObj.url;

        // Bouton supprimer
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '❌';
        deleteBtn.className = 'btn-delete';
        deleteBtn.addEventListener('click', () => {
            images.splice(index, 1);
            updatePreview();
        });

        // Bouton rotation
        const rotateBtn = document.createElement('button');
        rotateBtn.innerHTML = '🔄';
        rotateBtn.className = 'btn-rotate';
        rotateBtn.addEventListener('click', () => {
            imgObj.rotation = (imgObj.rotation + 90) % 360;
            updatePreview();
        });

        toolbar.appendChild(rotateBtn);
        toolbar.appendChild(deleteBtn);

        wrapper.appendChild(img);
        wrapper.appendChild(badge);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(info);
        previewSection.appendChild(wrapper);

        // Drag & Drop
        wrapper.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
        });

        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('text');
            const toIndex = index;
            swapImages(fromIndex, toIndex);
            updatePreview();
        });
    });
}

function swapImages(fromIndex, toIndex) {
    const temp = images[fromIndex];
    images[fromIndex] = images[toIndex];
    images[toIndex] = temp;
}

convertBtn.addEventListener('click', async () => {
    if (images.length === 0) {
        alert('Veuillez sélectionner des images.');
        return;
    }

    convertBtn.disabled = true;
    convertBtn.innerText = 'Conversion en cours...';

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    try {
        const orientation = document.getElementById('orientation').value;
        const pageSize = document.getElementById('pageSize').value;
        const margin = parseInt(document.getElementById('margin').value);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize,
        });

        for (let i = 0; i < images.length; i++) {
            if (i > 0) pdf.addPage();

            const imgData = await loadImage(images[i].url, images[i].rotation);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const usableWidth = pageWidth - 2 * margin;
            const usableHeight = pageHeight - 2 * margin;

            pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, usableHeight);

            
        
            // 🔥 Mise à jour de la barre de progression
            const progress = Math.round(((i + 1) / images.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.innerText = `Progression : ${progress}%`;


        }

        pdf.save('images_converties.pdf');

    } catch (error) {
        console.error('Erreur pendant la conversion:', error);
        alert('Erreur pendant la conversion.');
    } finally {
        convertBtn.disabled = false;
        convertBtn.innerText = 'Convertir en PDF';
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 1000);
    }
});

// Load image and apply rotation
function loadImage(url, rotation = 0) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (rotation === 90 || rotation === 270) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            ctx.restore();

            resolve(canvas.toDataURL('image/jpeg', 1.0));
        };
        img.src = url;
    });
}
