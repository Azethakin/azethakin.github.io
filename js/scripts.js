// Barre de recherche pour filtrer les cours par nom
document.getElementById('search').addEventListener('input', function () {
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

// Affiche un message de confirmation à la soumission du formulaire de contact
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        alert("Merci de m'avoir contacté ! Je vous répondrai dès que possible.");
    });
}

// Animation au survol des modules de cours
const modules = document.querySelectorAll('.course-box');

modules.forEach(module => {
    module.addEventListener('mouseover', () => {
        module.style.transform = 'scale(1.1)';
    });
    module.addEventListener('mouseout', () => {
        module.style.transform = 'scale(1.0)';
    });
});

// Validation des champs du formulaire de contact
if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Empêche l'envoi du formulaire pour vérifier

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validation des champs
        if (name === '' || email === '' || message === '') {
            alert("Veuillez remplir tous les champs.");
        } else {
            alert("Merci pour votre message, " + name + "! Nous vous répondrons bientôt.");
        }
    });
}

// Gestion de la sélection de la langue pour les textes dynamiques
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', function () {
        const lang = this.value;
        fetch(`lang/${lang}.json`)
            .then(response => response.json())
            .then(data => {
                document.querySelector('header h1').textContent = data.header_title;
                document.querySelector('.hero h2').textContent = data.hero_title;
                document.querySelector('.hero p').textContent = data.hero_subtitle;
            });
    });
}

// Script pour contrôler le zoom de l'image du CV
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const cvViewer = document.getElementById('cv-viewer'); // Sélection de l'élément image à zoomer

if (cvViewer) {
    // Variables pour gérer le zoom
    let zoomLevel = 1;

    // Événement pour zoomer
    zoomInButton.addEventListener('click', () => {
        zoomLevel += 0.1; // Incrémente le zoom de 0.1
        cvViewer.style.transform = `scale(${zoomLevel})`;
        cvViewer.style.transition = 'transform 0.3s ease'; // Animation douce
        centerImage(); // Centre l'image après le zoom
    });

    // Événement pour dézoomer
    zoomOutButton.addEventListener('click', () => {
        if (zoomLevel > 0.5) { // Limite de dézoom à 50%
            zoomLevel -= 0.1;
            cvViewer.style.transform = `scale(${zoomLevel})`;
            cvViewer.style.transition = 'transform 0.3s ease';
            centerImage(); // Centre l'image après le dézoom
        }
    });

    // Fonction pour centrer l'image après un zoom
    function centerImage() {
        const parentWidth = cvViewer.parentElement.offsetWidth;
        const imageWidth = cvViewer.offsetWidth * zoomLevel;

        if (imageWidth < parentWidth) {
            cvViewer.style.marginLeft = `${(parentWidth - imageWidth) / 2}px`;
        } else {
            cvViewer.style.marginLeft = `0px`;
        }
    }
}

// Script pour afficher/masquer les détails du CV
const cvButton = document.getElementById("cv-button");
const cvDetails = document.getElementById("cv-details");

if (cvButton && cvDetails) {
    cvButton.addEventListener("click", function () {
        if (cvDetails.style.display === "block") {
            cvDetails.style.display = "none";
        } else {
            cvDetails.style.display = "block";
        }
    });
}
