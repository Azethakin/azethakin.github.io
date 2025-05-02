const uploadInput = document.getElementById('upload');
const fileInfo = document.getElementById('fileInfo');
const fileNameSpan = document.getElementById('fileName');
const originalSizeSpan = document.getElementById('originalSize');
const compressedSizeSpan = document.getElementById('compressedSize');
const compressionRange = document.getElementById('compressionRange');
const compressionValue = document.getElementById('compressionValue');
const compressBtn = document.getElementById('compressBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');

let selectedFile = null;
let originalSize = 0;
let originalImageURL = null; // Pour conserver l'original

uploadInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;

    originalSize = selectedFile.size;
    fileNameSpan.innerText = selectedFile.name;
    originalSizeSpan.innerText = formatBytes(originalSize);
    updateCompressedSize();

    if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImageURL = e.target.result; // conserver
            originalPreview.src = e.target.result;
            compressedPreview.src = e.target.result;
            previewSection.style.display = 'flex';
        };
        reader.readAsDataURL(selectedFile);
    } else {
        previewSection.style.display = 'none';
    }

    fileInfo.style.display = 'block';
    document.querySelector('.compression-control').style.display = 'block';
    document.querySelector('.buttons').style.display = 'block';
});

compressionRange.addEventListener('input', updateCompressedSize);

function updateCompressedSize() {
    const percentage = parseInt(compressionRange.value);
    compressionValue.innerText = percentage;
    const estimatedSize = originalSize * (percentage / 100);
    compressedSizeSpan.innerText = formatBytes(estimatedSize);

    if (selectedFile && selectedFile.type.startsWith('image/')) {
        compressImage(selectedFile, percentage / 100).then(blob => {
            compressedPreview.src = URL.createObjectURL(blob);
        });
    }
}

compressBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    compressBtn.disabled = true;
    compressBtn.innerText = 'Compression en cours...';

    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.innerText = 'Progression : 0%';

    const compressionPercent = parseInt(compressionRange.value) / 100;

    if (selectedFile.type.startsWith('image/')) {
        const compressedBlob = await compressImage(selectedFile, compressionPercent);
        downloadBlob(compressedBlob, selectedFile.name.replace(/\.\w+$/, '_compressed.jpg'));

        // Remettre l'aperçu correctement
        originalPreview.src = originalImageURL;
        compressedPreview.src = URL.createObjectURL(compressedBlob);
    } else {
        const zip = new JSZip();
        zip.file(selectedFile.name, selectedFile);
        const blob = await zip.generateAsync({ type: "blob" }, (metadata) => {
            const percent = Math.round(metadata.percent);
            progressBar.style.width = `${percent}%`;
            progressText.innerText = `Progression : ${percent}%`;
        });
        downloadBlob(blob, 'fichier_compresse.zip');
    }

    compressBtn.disabled = false;
    compressBtn.innerText = 'Compresser et Télécharger';

    // ✅ Important : NE PAS vider le fichier sélectionné ni les aperçus
    compressionRange.value = 100;
    compressionValue.innerText = '100';
    updateCompressedSize();

    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressText.innerText = 'Progression : 0%';
    }, 1000);
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

async function compressImage(file, quality) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
