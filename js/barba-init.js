barba.hooks.afterEnter(() => {
  gtag('config', 'G-H30S5SETCF', {
    page_path: window.location.pathname
  });
});


barba.init({

    transitions: [
      {
        name: 'default-transition',
        leave(data) {
          return gsap.to(data.current.container, { opacity: 0 });
        },
        enter(data) {
          return gsap.from(data.next.container, { opacity: 0 });
        }
      }
    ],
    views: [


       {
            namespace: 'accueil',
            afterEnter() {
              console.log("Page d'accueil chargée !");
              // Tu peux lancer une animation ou du JS ici si besoin
              // Exemple : gsap.from(".hero", { opacity: 0, y: 50, duration: 1 });
            }
       },
          

      {
        namespace: 'licence_eeea_lyon1',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          document.body.appendChild(script);
        }
      },
      {
        namespace: 'contact',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          script.onload = () => {
            console.log("✅ Script EmailJS chargé !");
          };
          document.body.appendChild(script);
        }
      },
      {
        namespace: 'cv',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          document.body.appendChild(script);

       
        }
      }
      ,
      {
        namespace: 'deuxieme_annee_electronique_UMMTO',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          document.body.appendChild(script);
        }
      }
      ,
      {
        namespace: 'loisirs',
        afterEnter() {
          // Si tu veux ajouter un effet spécial ou un JS dédié à cette page un jour :
          // const script = document.createElement('script');
          // script.src = '../js/loisirs.js';
          // document.body.appendChild(script);
        }
      },
      {
        namespace: 'master1_toulon',
        afterEnter() {
          console.log('Page Master 1 Toulon chargée');
      
          // Tu peux charger un script JS spécial ici si besoin :
          // const script = document.createElement('script');
          // script.src = '../js/master1.js';
          // document.body.appendChild(script);
        }
      },
      {
        namespace: 'master2_toulon',
        afterEnter() {
          console.log("Page Master 2 chargée");
          // Si tu veux ajouter un script spécifique :
          // const script = document.createElement('script');
          // script.src = '../js/mon_script_master2.js';
          // document.body.appendChild(script);
        }
      },
      {
        namespace: 'mes_diplomes',
        afterEnter() {
          console.log("Page Mes Diplômes chargée !");
          // Tu peux aussi déclencher une animation ici avec GSAP si tu veux
          // gsap.from("h2", { opacity: 0, y: -20, duration: 1 });
        }
      },
      {
        namespace: 'parcours_universitaire',
        afterEnter() {
          console.log("Page Parcours Universitaire chargée !");
          // Ici tu peux ajouter une animation GSAP si tu veux
        }
      },
      {
        namespace: 'premiere_annee_science_et_technologie_UMMTO',
        afterEnter() {
          console.log('Page première année chargée');
          // Tu peux charger un script spécifique ici si besoin
        }
      },
      {
        namespace: 'projet_L3_UMMTO',
        afterEnter(data) {
          console.log('Page Projet L3 UMMTO chargée !');
          // Ici tu peux lancer un script spécifique à cette page
        }
      },
      {
        namespace: 'projets_réalisés',
        afterEnter() {
          console.log("Page Projets Réalisés chargée !");
          // Si tu veux ajouter un script ou une animation spéciale, tu le fais ici
          // Exemple : gsap.from(".project-box", { opacity: 0, y: 50, stagger: 0.2 });
        }
      },
      {
        namespace: 'Qui_suis_je',
        afterEnter() {
          console.log("Page 'Qui suis-je ?' chargée !");
          // Tu peux ajouter des animations GSAP ici si tu veux
          // gsap.from("h2, p, li", { opacity: 0, y: 20, duration: 1, stagger: 0.1 });
        }
      },
      
      {
        namespace: 'troisieme_annee_electronique_UMMTO',
        afterEnter() {
          console.log('Page Troisième Année Électronique chargée');
          // Tu peux charger un JS spécifique ici si nécessaire
        }
      },
      {
        namespace: 'redirect_accueil',
        afterEnter() {
          console.log('Page de redirection vers Accueil chargée');
          // Tu peux ajouter une animation ou un effet visuel ici si nécessaire
        }
      },
      {
        namespace: 'autres_diplomes_et_formations',
        afterEnter() {
          console.log("Page Autres Diplômes et Formations chargée !");
          // Tu peux ajouter une animation GSAP ici si tu veux :
          // gsap.from("li", { opacity: 0, y: 20, duration: 0.6, stagger: 0.1 });
        }
      },
      {
        namespace: 'baccalaureat',
        afterEnter() {
          console.log("Page Baccalauréat chargée !");
          // Tu peux ajouter ici des animations GSAP si tu veux :
          // gsap.from("p", { opacity: 0, y: 20, duration: 1 });
        }
      },
      {
        namespace: 'diplomes_academiques',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          document.body.appendChild(script);
        }
      },
      {
        namespace: 'espace_interactif',
        afterEnter() {
          const script = document.createElement('script');
          script.src = '../js/scripts.js';
          document.body.appendChild(script);
        }
      }
      
      
      
     
   
    ]
  });

 
  