document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById("cookie-consent");
    const box = document.querySelector(".cookie-box");
    const overlay = document.getElementById("cookie-overlay");
    const consent = localStorage.getItem("cookieConsent");

    // Affiche la bannière + overlay si aucun choix n'a encore été fait
    if (!consent) {
        banner?.classList.remove("hidden");
        box?.classList.remove("hidden");
        overlay?.classList.remove("hidden");
    } else {
        banner?.classList.add("hidden");
        box?.classList.add("hidden");
        overlay?.classList.add("hidden");
    }

    // Gestion des boutons
    document.getElementById("accept-all").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", "full");
        hideConsentUI();
        loadAnalytics({ full: true });
    });

    document.getElementById("reject-non-essential").addEventListener("click", function () {
        localStorage.setItem("cookieConsent", "essential-only");
        hideConsentUI();
        loadAnalytics({ full: false });
    });

    // Recharge GA selon le consentement déjà stocké
    if (consent === "full") {
        loadAnalytics({ full: true });
    } else if (consent === "essential-only") {
        loadAnalytics({ full: false });
    }

    function hideConsentUI() {
        banner?.classList.add("hidden");
        box?.classList.add("hidden");
        overlay?.classList.add("hidden");
    }

    // Fonction de chargement Google Analytics
    function loadAnalytics(options) {
        const fullConsent = options.full;

        const gtagScript = document.createElement("script");
        gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-F8YKGGC2Y6";
        gtagScript.async = true;
        document.head.appendChild(gtagScript);

        gtagScript.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }

            gtag('js', new Date());

            gtag('consent', 'default', {
                ad_storage: fullConsent ? 'granted' : 'denied',
                analytics_storage: 'granted'
            });

            gtag('config', 'G-F8YKGGC2Y6', {
                anonymize_ip: false, // ville/pays
                allow_ad_personalization_signals: fullConsent
            });

            setupBasicEvents(gtag);
            if (fullConsent) setupDetailedTracking(gtag);
        };
    }

    // Suivi du clic droit dans tous les cas (si gtag est disponible)
    document.body.addEventListener("contextmenu", function () {
        if (typeof gtag === "function") {
            gtag('event', 'clic_droit', {
                event_category: 'interaction_sensible',
                event_label: 'Clic droit sur la page ' + document.title
            });
        }
    });


    // Événements essentiels
    function setupBasicEvents(gtag) {
        gtag('event', 'page_view');

        document.addEventListener('scroll', () => {
            gtag('event', 'scroll', {
                event_category: 'interaction',
                event_label: window.location.pathname
            });
        }, { once: true });

        document.addEventListener('click', () => {
            gtag('event', 'click', {
                event_category: 'interaction',
                event_label: window.location.pathname
            });
        }, { once: true });
    }

    // Événements détaillés
    function setupDetailedTracking(gtag) {
        gtag('event', 'device_info', {
            device: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }
});
