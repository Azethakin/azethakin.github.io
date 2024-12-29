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
            message: `Bonjour ${prenom},\n\nMerci de m'avoir contacté ! J'ai bien reçu votre message. Je vous répondrai sous peu.\n\nCordialement,\nAziz Malloul`
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
                document.getElementById("resultMessage").textContent = "Message bien envoyé. Merci de nous avoir contacté!";
                
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
// S'assure que le script s'exécute après le chargement du DOM
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
    const zoomInButton = document.getElementById('zoom-in'); // Bouton Zoom +
    const zoomOutButton = document.getElementById('zoom-out'); // Bouton Zoom -
    const resetZoomButton = document.getElementById('reset-zoom'); // Bouton Réinitialiser
    const fullScreenButton = document.getElementById('fullscreen'); // Bouton Plein écran
    const cvImage = document.getElementById('cv-image'); // L'image du CV
    const cvViewer = document.querySelector('.cv-viewer'); // Conteneur de la photo de CV

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
        const cvViewer = document.querySelector('.cv-viewer'); // Conteneur de l'image
        const cvImage = document.getElementById('cv-image'); // Image du CV
    
        // Vérifie si l'image dépasse la largeur ou la hauteur du conteneur après le zoom
        const imageWidth = cvImage.offsetWidth * zoomLevel;
        const imageHeight = cvImage.offsetHeight * zoomLevel;
        const viewerWidth = cvViewer.clientWidth;
        const viewerHeight = cvViewer.clientHeight;
    
        // Active la barre horizontale si l'image dépasse la largeur du conteneur
        cvViewer.style.overflowX = imageWidth > viewerWidth ? 'scroll' : 'hidden';
    
        // Active la barre verticale si l'image dépasse la hauteur du conteneur
        cvViewer.style.overflowY = imageHeight > viewerHeight ? 'scroll' : 'hidden';
    }
    
    
    
    // Appelle cette fonction après chaque zoom
    zoomInButton.addEventListener('click', updateScrollBars);
    zoomOutButton.addEventListener('click', updateScrollBars);
    resetButton.addEventListener('click', updateScrollBars);
    
    // Appeler lors du chargement initial
    document.addEventListener('DOMContentLoaded', updateScrollBars);
    
    
});


