// // Barre de recherche pour filtrer les cours par nom
// document.getElementById('search').addEventListener('input', function () {
//     const filter = this.value.toLowerCase();
//     const courseBoxes = document.querySelectorAll('.course-box');

//     courseBoxes.forEach(box => {
//         let courseName = box.querySelector('h3').textContent.toLowerCase();
//         if (courseName.includes(filter)) {
//             box.style.display = '';
//         } else {
//             box.style.display = 'none';
//         }
//     });
// });






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

window.addEventListener('DOMContentLoaded', () => {
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







// Initialisation d'EmailJS avec votre clé publique
emailjs.init("M9PAHz9znIlnqxTIS");

// Envoi d'email lors de la soumission du formulaire de contact
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    // Récupère les valeurs des champs du formulaire
    const name = document.getElementById("name").value;
    const prenom = document.getElementById("prenom").value;
    const email = document.getElementById("email").value;
    const telephone = document.getElementById("telephone").value;
    const message = document.getElementById("message").value;

    

    // Paramètres pour l'email de confirmation au client
    const confirmationParams = {
      from_name: name,
      prenom: prenom,
      from_email: email,
      message: `Bonjour ${prenom},\n\nMerci de m'avoir contacté ! J'ai bien reçu votre message. Je vous répondrai sous peu.\n\nCordialement,\nAziz Malloul`
    };

    // Envoi de l'email avec le fichier joint via EmailJS
    emailjs.send("service_2oherbp", "template_p17maoh", adminParams)
      .then(function(response) {
        console.log("Email envoyé avec succès !", response.status, response.text);
        document.getElementById("resultMessage").style.display = "block";
        document.getElementById("resultMessage").style.color = "green";
        document.getElementById("resultMessage").textContent = "Message bien envoyé. Merci de nous avoir contacté!";
      }, function(error) {
        console.error("Erreur lors de l'envoi de l'email.", error);
        document.getElementById("resultMessage").style.display = "block";
        document.getElementById("resultMessage").style.color = "red";
        document.getElementById("resultMessage").textContent = "Erreur lors de l'envoi. Veuillez réessayer.";
      });
  });
}

