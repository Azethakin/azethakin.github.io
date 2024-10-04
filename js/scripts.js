// Barre de recherche pour filtrer les cours par nom
document.getElementById('search').addEventListener('input', function() {
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
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Merci de m'avoir contacté ! Je vous répondrai dès que possible.");
});

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

document.getElementById('contactForm').addEventListener('submit', function(event) {
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

document.getElementById('languageSelect').addEventListener('change', function() {
    const lang = this.value;
    // Charge le fichier JSON correspondant
    fetch(`lang/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            document.querySelector('header h1').textContent = data.header_title;
            document.querySelector('.hero h2').textContent = data.hero_title;
            document.querySelector('.hero p').textContent = data.hero_subtitle;
        });
});

