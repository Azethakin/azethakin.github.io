// =====================
// Barre de recherche pour filtrer les cours par nom
// =====================
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

// =====================
// Envoi d'emails avec EmailJS
// =====================
emailjs.init("M9PAHz9znIlnqxTIS");
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const prenom = document.getElementById("prenom").value;
        const email = document.getElementById("email").value;
        const telephone = document.getElementById("telephone").value;
        const message = document.getElementById("message").value;

        const emailParams = {
            from_name: name,
            prenom: prenom,
            from_email: email,
            telephone: telephone,
            message: message
        };

        emailjs.send("service_2oherbp", "template_p17maoh", emailParams)
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
