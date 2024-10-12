// =====================
// Fonction pour filtrer les cours avec la barre de recherche
// =====================

// Événement qui se déclenche lorsque l'utilisateur tape dans la barre de recherche
document.getElementById('search').addEventListener('input', function () {
    const filter = this.value.toLowerCase();  // Récupère la valeur saisie dans la barre de recherche et la convertit en minuscule
    const courseBoxes = document.querySelectorAll('.course-box');  // Sélectionne toutes les boîtes de cours

    // Parcourt chaque boîte de cours
    courseBoxes.forEach(box => {
        let courseName = box.querySelector('h3').textContent.toLowerCase();  // Récupère le texte du nom du cours en minuscule
        // Si le nom du cours contient le texte recherché, on l'affiche, sinon on le masque
        if (courseName.includes(filter)) {
            box.style.display = '';  // Affiche la boîte de cours
        } else {
            box.style.display = 'none';  // Masque la boîte de cours
        }
    });
});

// =====================
// Animation au survol des modules de cours
// =====================

// Sélectionne tous les éléments avec la classe "course-box"
const modules = document.querySelectorAll('.course-box');

// Ajoute des événements "mouseover" et "mouseout" à chaque module pour appliquer un effet de zoom
modules.forEach(module => {
    module.addEventListener('mouseover', () => {
        module.style.transform = 'scale(1.1)';  // Augmente la taille de la boîte lors du survol
        module.style.transition = 'transform 0.3s ease';  // Ajoute une transition fluide
    });
    module.addEventListener('mouseout', () => {
        module.style.transform = 'scale(1.0)';  // Rétablit la taille normale lorsque la souris quitte la boîte
    });
});

// =====================
// Gestion de la sélection de la langue pour les textes dynamiques
// =====================

// Sélectionne le sélecteur de langue
const languageSelect = document.getElementById('languageSelect');

// Vérifie si le sélecteur de langue existe sur la page
if (languageSelect) {
    // Ajoute un événement qui se déclenche lorsque la langue sélectionnée change
    languageSelect.addEventListener('change', function () {
        const lang = this.value;  // Récupère la langue sélectionnée (fr ou en)
        
        // Charge le fichier de langue correspondant (par exemple lang/fr.json ou lang/en.json)
        fetch(`lang/${lang}.json`)
            .then(response => response.json())  // Convertit la réponse en format JSON
            .then(data => {
                // Met à jour les éléments du site avec les textes de la langue sélectionnée
                document.querySelector('header h1').textContent = data.header_title;
                document.querySelector('.hero h2').textContent = data.hero_title;
                document.querySelector('.hero p').textContent = data.hero_subtitle;
            })
            .catch(error => console.error('Erreur lors du chargement du fichier de langue :', error));
    });
}

// =====================
// Gestion du zoom sur l'image du CV
// =====================

// Sélection des boutons de zoom et de l'image du CV
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const cvImage = document.getElementById('cv-image');

// Vérifie que les boutons et l'image existent sur la page
if (zoomInButton && zoomOutButton && cvImage) {
    let zoomLevel = 1;  // Niveau de zoom initial

    // Augmente le zoom de l'image du CV lorsqu'on clique sur le bouton "Zoom +"
    zoomInButton.addEventListener('click', () => {
        zoomLevel += 0.1;  // Augmente le niveau de zoom
        cvImage.style.transform = `scale(${zoomLevel})`;  // Applique le zoom à l'image
        cvImage.style.transition = 'transform 0.3s ease';  // Transition fluide lors du zoom
    });

    // Réduit le zoom de l'image du CV lorsqu'on clique sur le bouton "Zoom -"
    zoomOutButton.addEventListener('click', () => {
        if (zoomLevel > 0.5) {  // Empêche un zoom trop faible
            zoomLevel -= 0.1;  // Réduit le niveau de zoom
            cvImage.style.transform = `scale(${zoomLevel})`;  // Applique la réduction du zoom à l'image
            cvImage.style.transition = 'transform 0.3s ease';  // Transition fluide lors de la réduction
        }
    });
}

// =====================
// Envoi d'emails avec EmailJS
// =====================

// Initialisation d'EmailJS avec la clé publique
emailjs.init("M9PAHz9znIlnqxTIS");

// Sélection du formulaire de contact
const contactForm = document.getElementById("contactForm");

// Vérifie si le formulaire de contact existe sur la page
if (contactForm) {
    // Ajoute un événement de soumission au formulaire
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();  // Empêche le rechargement de la page lors de la soumission

        // Récupère les valeurs saisies dans les champs du formulaire
        const name = document.getElementById("name").value;
        const prenom = document.getElementById("prenom").value;
        const email = document.getElementById("email").value;
        const telephone = document.getElementById("telephone").value;
        const message = document.getElementById("message").value;

        // Paramètres à envoyer via EmailJS
        const emailParams = {
            from_name: name,
            prenom: prenom,
            from_email: email,
            telephone: telephone,
            message: message
        };

        // Envoi de l'email avec EmailJS
        emailjs.send("service_2oherbp", "template_p17maoh", emailParams)
            .then(function(response) {
                console.log("Email envoyé avec succès !", response.status, response.text);  // Affiche un message de succès dans la console
                document.getElementById("resultMessage").style.display = "block";  // Affiche le message de confirmation
                document.getElementById("resultMessage").style.color = "green";  // Change la couleur du message en vert
                document.getElementById("resultMessage").textContent = "Message bien envoyé. Merci de nous avoir contacté!";  // Texte de confirmation
            }, function(error) {
                console.error("Erreur lors de l'envoi de l'email.", error);  // Affiche un message d'erreur dans la console
                document.getElementById("resultMessage").style.display = "block";  // Affiche le message d'erreur
                document.getElementById("resultMessage").style.color = "red";  // Change la couleur du message en rouge
                document.getElementById("resultMessage").textContent = "Erreur lors de l'envoi. Veuillez réessayer.";  // Texte d'erreur
            });
    });
}
