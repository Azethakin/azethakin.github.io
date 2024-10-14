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
// Gestion du zoom sur l'image du CV
// =====================
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const cvImage = document.getElementById('cv-image');
if (zoomInButton && zoomOutButton && cvImage) {
    let zoomLevel = 1;
    zoomInButton.addEventListener('click', () => {
        zoomLevel += 0.1;
        cvImage.style.transform = `scale(${zoomLevel})`;
        cvImage.style.transition = 'transform 0.3s ease';
    });
    zoomOutButton.addEventListener('click', () => {
        if (zoomLevel > 0.5) {
            zoomLevel -= 0.1;
            cvImage.style.transform = `scale(${zoomLevel})`;
            cvImage.style.transition = 'transform 0.3s ease';
        }
    });
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// =====================
// Envoi d'emails avec EmailJS
// =====================

// Initialisation d'EmailJS avec la clé publique
emailjs.init("M9PAHz9znIlnqxTIS");

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

// =====================
// Carrousel d'images automatiques
// =====================

// Lorsque le document est entièrement chargé
// S'assure que le script s'exécute après le chargement du DOM
// S'assure que le script s'exécute après le chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    const carouselInner = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    let index = 0;
    const totalItems = items.length;

    function showNextImage() {
        // Incrémente l'index pour passer à l'image suivante
        index = (index + 1) % totalItems;
        // Applique une transformation pour déplacer le carrousel vers la gauche
        carouselInner.style.transition = 'transform 1s ease-in-out'; // Transition de 1 seconde
        carouselInner.style.transform = `translateX(-${index * 100}%)`;
    }

    // Changement d'image toutes les 3 secondes (3000ms)
    setInterval(showNextImage, 4000); // 3000ms pour laisser l'image et 1000ms pour la transition
});




