// =====================
// Barre de recherche pour filtrer les cours par nom
// =====================

const searchElement = document.getElementById('search');
if (searchElement) {
    // Si l'élément de recherche existe, on ajoute l'écouteur d'événements
    searchElement.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        const courseBoxes = document.querySelectorAll('.course-box');

        courseBoxes.forEach(box => {
            let courseName = box.querySelector('h3').textContent.toLowerCase();
            if (courseName.includes(filter)) {
                box.style.display = '';
            } else {
                box.style.display = 'none';
            }
        });
    });
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// =====================
// Animation au survol des modules de cours
// =====================
const modules = document.querySelectorAll('.course-box');
modules.forEach(module => {
    module.addEventListener('mouseover', () => {
        module.style.transform = 'scale(1.1)';
        module.style.transition = 'transform 0.3s ease';
    });
    module.addEventListener('mouseout', () => {
        module.style.transform = 'scale(1.0)';
    });
});





//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// =====================
// Envoi d'emails avec EmailJS
// =====================

// Sélection du formulaire de contact
const contactForm = document.getElementById("contactForm");

// Vérifie si le formulaire de contact existe sur la page
if (contactForm) {
    // Sélectionne le bouton de soumission
    const submitButton = document.querySelector('.btn-submit');

    // Ajoute un événement de soumission au formulaire
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche le rechargement de la page lors de la soumission

        // Désactive le bouton immédiatement après le clic
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#ccc';  // Grise le bouton pour donner un feedback visuel

        // Récupère les valeurs saisies dans les champs du formulaire
        const name = document.getElementById("name").value;
        const prenom = document.getElementById("prenom").value;
        const email = document.getElementById("email").value;
        const telephone = document.getElementById("telephone").value;
        const message = document.getElementById("message").value;

        // Paramètres pour l'email à l'administrateur
        const adminParams = {
            from_name: name,
            prenom: prenom,
            from_email: email,
            telephone: telephone,
            message: message
        };

        // Paramètres pour l'email de confirmation au client
        const confirmationParams = {
            from_name: name,
            prenom: prenom,
            from_email: email,
            message: `Bonjour ${prenom},\n\nMerci de m'avoir contacté ! Votre message a bien été reçu, et je reviendrai vers vous sous peu.\n\nCordialement,\nAziz Malloul`
        };

        // Envoie de l'email à l'administrateur
        emailjs.send("service_2oherbp", "template_p17maoh", adminParams)
            .then(function(response) {
                console.log("Email à l'administrateur envoyé avec succès !", response.status, response.text);

                // Envoie de l'email de confirmation au client
                return emailjs.send("service_2oherbp", "template_ma4adv9", confirmationParams);
            })
            .then(function(response) {
                console.log("Email de confirmation envoyé avec succès !", response.status, response.text);

                // Affiche le message de succès et réactive le bouton après succès
                document.getElementById("resultMessage").style.display = "block";
                document.getElementById("resultMessage").style.color = "green";
                document.getElementById("resultMessage").textContent = "Message bien envoyé. Merci de m'avoir contacté!";

                // Réactive le bouton après 3 secondes (ou immédiatement si souhaité)
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.style.backgroundColor = '';  // Réinitialise la couleur du bouton
                }, 3000);
            })
            .catch(function(error) {
                console.error("Erreur lors de l'envoi de l'email.", error);

                // Affiche un message d'erreur et réactive le bouton en cas d'échec
                document.getElementById("resultMessage").style.display = "block";
                document.getElementById("resultMessage").style.color = "red";
                document.getElementById("resultMessage").textContent = "Erreur lors de l'envoi. Veuillez réessayer.";

                // Réactive le bouton en cas d'échec
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';  // Réinitialise la couleur du bouton
            });
    });
}




//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// Lorsque le document est entièrement chargé
// les images de la page d'acueil
// S'assure que le script s'exécute après le chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.image-container img');
    let currentIndex = 0;
    const totalImages = images.length;

    function changeImage() {
        // Enlève la classe 'active' de l'image actuelle
        images[currentIndex].classList.remove('active');

        // Incrémente l'index pour passer à l'image suivante
        currentIndex = (currentIndex + 1) % totalImages;

        // Ajoute la classe 'active' à la nouvelle image
        images[currentIndex].classList.add('active');
    }

    // Change d'image toutes les 3 secondes (3000ms)
    setInterval(changeImage, 3000);
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// changement des images de container Loisir (foot, guitare, plongée sous marine, chasse sous marine, surf, velo)

// changement des images de container Loisir ( only foot)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationfoot(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir
    setupImageRotationfoot('image-container-football');
    //setupImageRotation('image-container-guitar');
    //setupImageRotation('image-container-surf');
    //setupImageRotation('image-container-chasse_sous_marine');
    //setupImageRotation('image-container-bouteille');
    //setupImageRotation('image-container-velo');
});

// changement des images de container Loisir ( only guitar)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationguitar(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir

    setupImageRotationguitar('image-container-guitar');

});


// changement des images de container Loisir ( only plongée sous marine)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationbouteille(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir
    //setupImageRotation('image-container-football');
    //setupImageRotation('image-container-guitar');
    //setupImageRotation('image-container-surf');
    //setupImageRotation('image-container-chasse_sous_marine');
    setupImageRotationbouteille('image-container-bouteille');
    //setupImageRotation('image-container-velo');
});


// changement des images de container Loisir ( only chasse sous marine)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationchasse(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir
    //setupImageRotation('image-container-football');
    //setupImageRotation('image-container-guitar');
    //setupImageRotation('image-container-surf');
    setupImageRotationchasse('image-container-chasse_sous_marine');
    //setupImageRotationbouteille('image-container-bouteille');
    //setupImageRotation('image-container-velo');
});


// changement des images de container Loisir ( only surf)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationsurf(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir
    //setupImageRotation('image-container-football');
    //setupImageRotation('image-container-guitar');
    setupImageRotationsurf('image-container-surf');
    //setupImageRotation('image-container-chasse_sous_marine');
    //setupImageRotationbouteille('image-container-bouteille');
    //setupImageRotation('image-container-velo');
});


// changement des images de container Loisir ( only velo)
document.addEventListener('DOMContentLoaded', function () {
    // Une fonction générique pour gérer les changements d'images
    function setupImageRotationvelo(containerClass) {
        const images = document.querySelectorAll(`.${containerClass} img`);
        let currentIndex = 0;
        const totalImages = images.length;

        function changeImage() {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % totalImages;
            images[currentIndex].classList.add('active');
        }

        setInterval(changeImage, 2000); // Change toutes les 2 secondes
    }

    // Appelez la fonction pour chaque conteneur de loisir
    //setupImageRotation('image-container-football');
    //setupImageRotation('image-container-guitar');
    //setupImageRotation('image-container-surf');
    //setupImageRotation('image-container-chasse_sous_marine');
    //setupImageRotationbouteille('image-container-bouteille');
    setupImageRotationvelo('image-container-velo');
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// pour les smartphone
// Gestion du menu hamburger pour smartphones
// Fonction pour basculer le menu mobile
// JavaScript pour afficher/masquer le menu mobile
// Ajout de l'événement 'click' sur l'icône hamburger
// Sélectionner l'élément de l'icône hamburger
const hamburger = document.getElementById('hamburger-menu');
// Sélectionner le menu mobile
const mobileNav = document.getElementById('mobile-nav');

// Ajouter un écouteur d'événement au clic sur l'icône hamburger
hamburger.addEventListener('click', function () {
    // Basculer la classe 'show' pour afficher/masquer le menu
    mobileNav.classList.toggle('show');

    // Basculer une classe sur le body pour éviter le défilement quand le menu est ouvert
    document.body.classList.toggle('menu-open');

    console.log(hamburger); // Doit afficher l'élément dans la console

});













/* ================================================
  pour la page de cv

   ================================================ */

// ==================================================
// FONCTIONNALITÉS COMMUNES POUR MOBILE ET DESKTOP
// ==================================================

// ==========================================
// Gestion des Boutons de Zoom et Plein Écran
// ==========================================

// Exécute le script une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', function () {
    // Sélection des éléments

    const cvViewer = document.querySelector('.cv-viewer'); // Conteneur de la photo de CV
    if (!cvViewer) return; // ⛔ Si pas sur la page CV, on ne fait rien

    const zoomInButton = document.getElementById('zoom-in'); // Bouton Zoom +
    const zoomOutButton = document.getElementById('zoom-out'); // Bouton Zoom -
    const resetZoomButton = document.getElementById('reset-zoom'); // Bouton Réinitialiser
    const fullScreenButton = document.getElementById('fullscreen'); // Bouton Plein écran
    const cvImage = document.getElementById('cv-image'); // L'image du CV
    const cvLanguageSelector = document.getElementById('cv-language');


    // Permet de capturer uniquement le défilement vertical avec la roulette
    cvViewer.addEventListener('wheel', function (event) {
        const isAtTop = cvViewer.scrollTop === 0; // Vérifie si on est en haut de la zone du CV
        const isAtBottom =
            cvViewer.scrollTop + cvViewer.clientHeight >= cvViewer.scrollHeight; // Vérifie si on est en bas de la zone du CV

        if ((event.deltaY < 0 && isAtTop) || (event.deltaY > 0 && isAtBottom)) {
            // Laisse le défilement se propager à la page
            cvViewer.blur(); // Perd le focus pour permettre le défilement global
        } else {
            // Sinon, empêche le défilement global
            event.preventDefault(); // Empêche le défilement global si on est dans la zone du CV
            cvViewer.scrollBy({
                top: event.deltaY * 4, // Déplace verticalement
                behavior: 'smooth', // Ajoute une animation fluide au défilement
            });
        }
    });


    let zoomLevel = 1; // Niveau de zoom initial

  // Fonction pour zoomer sur l'image
    zoomInButton.addEventListener('click', () => {
        if (zoomLevel < 5) { // Limite maximale de zoom à 200%
            zoomLevel += 0.1;
            updateZoom();
            updateScrollBars(); // Met à jour les barres de défilement
        }
    });

    // Fonction pour dézoomer sur l'image
    zoomOutButton.addEventListener('click', () => {
        if (zoomLevel > 0.5) { // Limite minimale de zoom à 50%
            zoomLevel -= 0.1;
            updateZoom();
            updateScrollBars(); // Met à jour les barres de défilement
        }
    });

    resetZoomButton.addEventListener('click', () => {
        zoomLevel = 1; // Réinitialise le niveau de zoom à la taille initiale
        updateZoom(); // Met à jour l'affichage
        updateScrollBars(); // Met à jour les barres de défilement
    });


    // Fonction pour passer en plein écran
    fullScreenButton.addEventListener('click', function () {
        if (cvViewer.requestFullscreen) {
            cvViewer.requestFullscreen(); // Active le mode plein écran
        } else if (cvViewer.webkitRequestFullscreen) {
            cvViewer.webkitRequestFullscreen(); // Compatibilité pour Safari
        } else if (cvViewer.msRequestFullscreen) {
            cvViewer.msRequestFullscreen(); // Compatibilité pour IE/Edge
        }
    });

    // Fonction pour mettre à jour l'échelle de l'image
    function updateZoom() {
        cvImage.style.transform = `scale(${zoomLevel})`; // Applique le zoom
        cvImage.style.transition = 'transform 0.3s ease'; // Animation fluide du zoom
    }

        // Ajoutez un événement pour empêcher l'image de dépasser les limites
    cvImage.addEventListener('wheel', (event) => {
        event.preventDefault(); // Empêche le défilement par défaut
    });

    function updateScrollBars() {
        const imageWidth = cvImage.offsetWidth * zoomLevel;
        const viewerWidth = cvViewer.clientWidth;

        cvViewer.style.overflowX = imageWidth > viewerWidth ? 'scroll' : 'hidden';
        cvViewer.style.overflowY = 'auto';

        // Centrage horizontal pour transform-origin: top center
        const scrollLeft = (imageWidth - viewerWidth) / 2;
        requestAnimationFrame(() => {
            cvViewer.scrollLeft = scrollLeft;
        });
    }


    cvLanguageSelector.addEventListener('change', function () {
        const selectedLang = this.value;

        if (selectedLang === 'en') {
            cvImage.src = '../images/CV_Aziz_MALLOUL_EN.webp';
            gtag('event', 'switch_cv_lang', {
                event_category: 'interaction',
                event_label: 'Version anglaise'
            });
        } else {
            cvImage.src = '../images/CV_Aziz_MALLOUL_FR.webp';
            gtag('event', 'switch_cv_lang', {
                event_category: 'interaction',
                event_label: 'Version française'
            });
        }
    });


    // Appelle cette fonction après chaque zoom
    zoomInButton.addEventListener('click', updateScrollBars);
    zoomOutButton.addEventListener('click', updateScrollBars);
    resetZoomButton.addEventListener('click', updateScrollBars);

});

























// cette partie pour le fichier redimmentionner_images

// === MODULE Principal du site (exécute des comportements globaux) ===
(function () {
    // Vérification simple : si ce n'est pas une page "image-editor", on ne fait rien
    if (!document.querySelector('.image-editor')) return;

    // Variables globales
    let originalImage = null;
    const MAX_WIDTH = 4000;
    const MAX_HEIGHT = 4000;

    // Sélection rapide des éléments
    const uploadInput = document.getElementById('upload');
    const brightnessInput = document.getElementById('brightness');
    const sharpnessInput = document.getElementById('sharpness');
    const scaleInput = document.getElementById('scale');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    const originalCanvas = document.getElementById('originalCanvas');
    const editedCanvas = document.getElementById('editedCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const editedCtx = editedCanvas.getContext('2d');

    // Ajout des événements
    uploadInput.addEventListener('change', handleUpload);
    brightnessInput.addEventListener('input', applyChanges);
    sharpnessInput.addEventListener('input', applyChanges);
    scaleInput.addEventListener('input', applyChanges);
    resetBtn.addEventListener('click', resetControls);
    downloadBtn.addEventListener('click', downloadEditedImage);

    function handleUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                originalImage = resizeImage(img);
                drawOriginal();
                applyChanges();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function resizeImage(img) {
        // Limiter l'image pour éviter les ralentissements
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

        // Appliquer l'éclaircissement
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(data[i] * brightness, 255);     // R
            data[i + 1] = Math.min(data[i + 1] * brightness, 255); // G
            data[i + 2] = Math.min(data[i + 2] * brightness, 255); // B
        }
        editedCtx.putImageData(imageData, 0, 0);

        // Appliquer la netteté
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
        const side = 3;
        const halfSide = 1;

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
                dst[dstOffset + 3] = 255; // Alpha
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
