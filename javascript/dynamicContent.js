document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const profession = urlParams.get('profession');

    if (profession) {
        const professionLogo = document.getElementById('profession-logo');
        const professionTitle = document.getElementById('profession-title');

        // Chemin du logo
        const logoPath = `/ajoutprofession/${profession}/logo-${profession}.png`;

        // Vérifier l'existence du logo
        fetch(logoPath)
            .then(response => {
                if (response.ok) {
                    professionLogo.src = logoPath;
                    professionLogo.alt = `Logo ${profession.charAt(0).toUpperCase() + profession.slice(1)}`;
                    professionLogo.style.display = 'block';
                } else {
                    professionLogo.style.display = 'none';
                }
            })
            .catch(() => {
                professionLogo.style.display = 'none';
            });

        professionTitle.textContent = profession.charAt(0).toUpperCase() + profession.slice(1);

        // Charger les professionnels de cette profession
        fetch(`/json/professions.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Profession data loaded: ", data); // Log les données chargées

                if (data[profession] && data[profession].length > 0) {
                    const professionals = data[profession];
                    const container = document.getElementById('new-professions'); // Remplacer ici

                    professionals.forEach(professional => {
                        console.log("Processing professional: ", professional); // Log chaque professionnel

                        const pdf = professional.pdf ? `<a href="/ajoutprofession/${profession}/${professional.pdf.path}" download="${professional.pdf.name}" class="download-link">Autre</a>` : '';
                        
                        const textsHTML = professional.texts.map(text => `
                            <h4>${text.filename}</h4>
                            <ul>
                                ${text.content.map(line => `<li>${line}</li>`).join('')}
                            </ul>
                        `).join('');

                        const imagePath = `/ajoutprofession/${profession}/${professional.image}`;
                        console.log("Image path: ", imagePath);

                        const professionalHTML = `
                            <div class="button-section">
                                <div class="button-row">
                                    <div class="left-text">${professional.name}</div>
                                    <div class="learn-more" onclick="toggleText(this)">En savoir +</div>
                                    <a href="${professional.doctolib}" target="_blank">
                                        <button class="book-appointment">Prendre rendez-vous</button>
                                    </a>
                                </div>
                                <div class="collapsible-content">
                                    <div class="content-wrapper">
                                        <img src="${imagePath}" alt="Profile Image" />
                                        <div class="text-content">
                                            ${textsHTML}
                                            ${pdf}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        container.innerHTML += professionalHTML;
                    });
                } else {
                    console.error(`No professionals found for the profession: ${profession}`);
                    const container = document.getElementById('new-professions'); // Remplacer ici
                    container.innerHTML = `<p>Aucun professionnel trouvé pour la profession "${profession}".</p>`;
                }
            })
            .catch(error => {
                console.error('Error loading professions.json:', error);
            });
    }
});

// Fonction pour afficher/masquer le texte
function toggleText(element) {
    const content = element.parentElement.nextElementSibling;
    content.classList.toggle('show');
}
