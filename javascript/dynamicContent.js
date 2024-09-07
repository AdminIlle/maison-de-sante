document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const profession = urlParams.get('profession');

    // Charger le fichier JSON des professions
    fetch('/json/professions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des professions.');
            }
            return response.json();
        })
        .then(data => {
            console.log("Données chargées :", data);
            if (profession) {
                const professionData = data.find(prof => prof.profession.toLowerCase() === profession.toLowerCase());
                console.log("Données de la profession trouvée :", professionData);
                if (professionData) {
                    displayProfessionData(professionData);
                } else {
                    console.error("Profession non trouvée.");
                }
            }
        })
        .catch(error => {
            console.error('Erreur de chargement des professions:', error);
        });
});

function displayProfessionData(professionData) {
    const professionTitle = document.getElementById('profession-title');
    const professionLogo = document.getElementById('profession-logo');
    const personnelContainer = document.getElementById('profession-container');

    if (!professionTitle || !personnelContainer || !professionLogo) {
        console.error("Les éléments DOM pour l'affichage des professionnels ne sont pas trouvés.");
        return;
    }

    // Titre de la profession
    professionTitle.textContent = professionData.profession;

    // Afficher le logo de la profession
    if (professionData.logo) {
        professionLogo.src = encodeURIComponent(professionData.logo).replace(/%2F/g, '/');
        professionLogo.alt = `Logo ${professionData.profession}`;
        professionLogo.style.display = 'block';
    } else {
        console.warn("Aucun logo trouvé pour la profession.");
    }

    personnelContainer.innerHTML = '';

    // Si aucun personnel n'est disponible
    if (professionData.personnel.length === 0) {
        personnelContainer.innerHTML = "<p>Aucun professionnel disponible pour cette profession.</p>";
        return;
    }

    // Traiter chaque personnel
    professionData.personnel.forEach(personnel => {
        console.log("Traitement du personnel :", personnel);

        // Trier les fichiers texte par numéro
        const sortedTexts = personnel.documents
            .filter(doc => doc.endsWith('.txt') && !doc.includes('doctolib'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/));
                const numB = parseInt(b.match(/\d+/));
                return numA - numB;
            });

        const textsHTML = sortedTexts.map(textFile => {
            const title = textFile.replace(/\d+\.txt$/, '').replace(/_/g, ' ').trim();
            const content = personnel.textContents ? personnel.textContents[textFile] : 'Contenu introuvable.';
            return `
                <h4>${title}</h4>
                <p>${content}</p>
            `;
        }).join('');

        if (textsHTML === '') {
            console.warn("Aucun texte disponible pour ce professionnel.");
        }

        const doctolibLink = personnel.doctolib ? `
            <a href="${personnel.doctolib}" target="_blank">
                <button class="book-appointment">Prendre rendez-vous</button>
            </a>
        ` : '';

        const pdf = personnel.documents.filter(doc => doc.endsWith('.pdf')).map(pdfFile => {
            return `<p>Document PDF: ${pdfFile}</p>`;
        }).join('');

        const isSinglePersonnel = professionData.personnel.length === 1;
        const collapsibleContentClass = isSinglePersonnel ? 'collapsible-content show' : 'collapsible-content';

        // Construction du HTML avec le lien Doctolib sous "En savoir +"
        const personnelHTML = `
            <div class="button-section">
                <div class="button-row">
                    <div class="left-text">${personnel.name}</div>
                    <div class="learn-more" onclick="toggleText(this)">En savoir +</div>
                </div>
                <div class="${collapsibleContentClass}">
                    <div class="content-wrapper">
                        <img src="/ajoutprofession/${encodeURIComponent(professionData.profession)}/${encodeURIComponent(personnel.name)}/logo-${encodeURIComponent(personnel.name)}.png" alt="Profile Image" />
                        <div class="text-content">
                            ${textsHTML}
                            ${doctolibLink}  <!-- Le lien Doctolib s'affiche ici -->
                            ${pdf}
                        </div>
                    </div>
                </div>
            </div>
        `;

        console.log("HTML injecté pour le personnel :", personnelHTML);
        personnelContainer.innerHTML += personnelHTML;
    });
}

// Fonction pour afficher/masquer le texte
function toggleText(element) {
    const content = element.parentElement.nextElementSibling;
    content.classList.toggle('show');
}
