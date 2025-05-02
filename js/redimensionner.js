(function() {
    if (!document.querySelector('.image-editor')) return;

    let originalImage = null;
    const MAX_WIDTH = 3000; // Limite maximale de largeur pour l'image originale
    const MAX_HEIGHT = 3000; // Limite maximale de hauteur pour l'image originale

    const uploadInput = document.getElementById('upload');
    const brightnessInput = document.getElementById('brightness');
    const sharpnessInput = document.getElementById('sharpness');
    const scaleInput = document.getElementById('scale');
    const resetButton = document.getElementById('resetBtn');
    const downloadButton = document.getElementById('downloadBtn');

    const originalCanvas = document.getElementById('originalCanvas');
    const editedCanvas = document.getElementById('editedCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const editedCtx = editedCanvas.getContext('2d');

    uploadInput.addEventListener('change', handleUpload);
    brightnessInput.addEventListener('input', applyChanges);
    sharpnessInput.addEventListener('input', applyChanges);
    scaleInput.addEventListener('input', applyChanges);
    resetButton.addEventListener('click', resetControls);
    downloadButton.addEventListener('click', downloadEditedImage);

    function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = resizeImage(img);
                drawOriginal();
                applyChanges();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function resizeImage(img) {
        // Réduit l'image si elle est trop grande
        const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height, 1);
        if (ratio < 1) {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resizedImg = new Image();
            resizedImg.src = canvas.toDataURL();
            return resizedImg;
        }
        return img;
    }

    function drawOriginal() {
        if (!originalImage) return;
        originalCanvas.width = originalImage.width;
        originalCanvas.height = originalImage.height;
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        originalCtx.drawImage(originalImage, 0, 0);
    }

    function applyChanges() {
        if (!originalImage) return;

        const brightness = parseFloat(brightnessInput.value);
        const sharpness = parseFloat(sharpnessInput.value);
        const scale = parseFloat(scaleInput.value) / 100;

        editedCanvas.width = originalImage.width * scale;
        editedCanvas.height = originalImage.height * scale;

        editedCtx.clearRect(0, 0, editedCanvas.width, editedCanvas.height);
        editedCtx.drawImage(originalImage, 0, 0, editedCanvas.width, editedCanvas.height);

        let imageData = editedCtx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
        let data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(data[i] * brightness, 255);     // Rouge
            data[i + 1] = Math.min(data[i + 1] * brightness, 255); // Vert
            data[i + 2] = Math.min(data[i + 2] * brightness, 255); // Bleu
        }

        editedCtx.putImageData(imageData, 0, 0);

        if (sharpness > 1) {
            sharpen(editedCtx, editedCanvas.width, editedCanvas.height, sharpness);
        }
    }

    function sharpen(ctx, width, height, intensity) {
        const weights = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];
        const side = Math.round(Math.sqrt(weights.length));
        const halfSide = Math.floor(side / 2);

        const srcData = ctx.getImageData(0, 0, width, height);
        const src = srcData.data;
        const output = ctx.createImageData(width, height);
        const dst = output.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        const scy = y + cy - halfSide;
                        const scx = x + cx - halfSide;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            const srcOffset = (scy * width + scx) * 4;
                            const wt = weights[cy * side + cx];
                            r += src[srcOffset] * wt;
                            g += src[srcOffset + 1] * wt;
                            b += src[srcOffset + 2] * wt;
                        }
                    }
                }
                const dstOffset = (y * width + x) * 4;
                dst[dstOffset] = Math.min(Math.max(r * intensity, 0), 255);
                dst[dstOffset + 1] = Math.min(Math.max(g * intensity, 0), 255);
                dst[dstOffset + 2] = Math.min(Math.max(b * intensity, 0), 255);
                dst[dstOffset + 3] = 255;
            }
        }
        ctx.putImageData(output, 0, 0);
    }

    function resetControls() {
        brightnessInput.value = 1;
        sharpnessInput.value = 1;
        scaleInput.value = 100;
        drawOriginal();
        applyChanges();
    }

    function downloadEditedImage() {
        const link = document.createElement('a');
        link.download = 'image_modifiee.png';
        link.href = editedCanvas.toDataURL('image/png');
        link.click();
    }
})();
