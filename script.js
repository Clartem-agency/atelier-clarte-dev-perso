document.addEventListener('DOMContentLoaded', function () {

    // --- GESTION DU THÈME (LIGHT/DARK MODE) ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const docHtml = document.documentElement; // Cible la balise <html>

    function applyTheme(theme) {
        if (theme === 'light') {
            docHtml.setAttribute('data-theme', 'light');
        } else {
            docHtml.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentTheme = docHtml.hasAttribute('data-theme') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }
    
    // --- GESTION DE LA SAUVEGARDE LOCALE ---
    const STORAGE_KEY = 'clartem-briefing-coach-data';
    let allFormElements = [];
    let saveTimeout;

    // --- CONFIGURATION CENTRALE DES SECTIONS ---
    const SECTIONS_CONFIG = [
        { id: 'section-0-foundations', key: 'foundations', name: 'Fondations : Votre Nom', keyFields: ['domain-choice-final'], isOptional: false, isFilled: () => !!document.getElementById('domain-choice-final')?.value.trim() },
        { id: 'section-1-hero', key: 'hero', name: 'Héros : Votre Promesse', keyFields: ['hero-title-1', 'hero-cta-primary'], isOptional: false, isFilled: () => !!document.getElementById('hero-title-1')?.value.trim() },
        { id: 'section-2-about', key: 'about', name: 'À Propos : Votre Histoire', keyFields: ['about-title-final', 'about-story-final'], isOptional: false, isFilled: () => !!document.getElementById('about-title-final')?.value.trim() },
        { id: 'section-3-services', key: 'services', name: 'Accompagnements : Vos Offres', keyFields: ['services-title-final', 'service-1-name'], isOptional: false, isFilled: () => !!document.getElementById('service-1-name')?.value.trim() },
        { id: 'section-4-approach', key: 'approach', name: 'Approche : Votre Méthode', keyFields: ['approach-title-final', 'approach-step-1-title'], isOptional: false, isFilled: () => !!document.getElementById('approach-title-final')?.value.trim() },
        { id: 'section-5-portfolio', key: 'portfolio', name: 'Galerie : Votre Univers', keyFields: ['portfolio-title-final', 'portfolio-1-image'], isOptional: false, isFilled: () => !!document.getElementById('portfolio-1-image')?.value.trim() },
        { id: 'section-6-testimonials', key: 'testimonials', name: 'Témoignages : Leurs Histoires', keyFields: ['testimonials-title-final', 'testimonial-1-text'], isOptional: false, isFilled: () => !!document.getElementById('testimonial-1-name')?.value.trim() },
        { id: 'section-7-faq', key: 'faq', name: 'FAQ : Leurs Questions', keyFields: ['faq-title-final', 'faq-q-1'], isOptional: false, isFilled: () => !!document.getElementById('faq-q-1')?.value.trim() },
        { id: 'section-8-blog', key: 'blog', name: 'Blog (Optionnel)', keyFields: ['blog-title-final'], isOptional: true, isFilled: () => !!document.getElementById('blog-title-final')?.value.trim() },
        { id: 'section-9-leadmagnet', key: 'leadmagnet', name: 'Ressource (Optionnel)', keyFields: ['leadmagnet-title'], isOptional: true, isFilled: () => !!document.getElementById('leadmagnet-title')?.value.trim() },
        { id: 'section-10-booking', key: 'booking', name: 'Rendez-vous : L\'Outil', keyFields: ['booking-title-final', 'booking-event-name'], isOptional: false, isFilled: () => !!document.getElementById('booking-title-final')?.value.trim() },
        { id: 'section-11-contact', key: 'contact', name: 'Contact : Le Hub Final', keyFields: ['contact-title-final', 'contact-reception-email'], isOptional: false, isFilled: () => !!document.getElementById('contact-title-final')?.value.trim() },
        { id: 'section-12-architecture', key: 'architecture', name: 'Architecture : Le Récit', keyFields: ['plan-choice-b'], isOptional: false, isFilled: () => !!document.querySelector('input[name="architecture-plan-choice"]:checked') },
        { id: 'section-15-conclusion', key: 'conclusion', name: 'Conclusion & Envoi', keyFields: [], isOptional: false, isFilled: () => true }
    ];

    function showSaveNotification() {
        const saveStatus = document.getElementById('save-status');
        if (!saveStatus) return;
        if (saveTimeout) clearTimeout(saveTimeout);
        saveStatus.classList.add('visible');
        saveTimeout = setTimeout(() => {
            saveStatus.classList.remove('visible');
        }, 2000);
    }

    function saveData() {
        const data = {};
        allFormElements.forEach(el => {
            const id = el.id;
            if (!id) return;
            if (el.type === 'checkbox' || el.type === 'radio') {
                data[id] = el.checked;
            } else if (el.type === 'file') {
                // Pour les fichiers, on sauvegarde le nom pour le message "re-sélectionner"
                // La vraie valeur (URL) est dans le champ caché, qui est aussi sauvegardé.
                data[id] = el.files.length > 0 ? el.files[0].name : '';
            } else {
                data[id] = el.value;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        showSaveNotification();
    }

    function loadData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;
        const data = JSON.parse(savedData);
        allFormElements.forEach(el => {
            const id = el.id;
            if (data[id] !== undefined) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = data[id];
                } else if (el.type === 'file') {
                    // Si un nom de fichier était sauvegardé, on affiche le message
                    // L'URL est chargée dans le champ caché correspondant.
                    if (data[id]) {
                        const infoSpan = document.createElement('span');
                        infoSpan.className = 'file-reselect-info';
                        infoSpan.textContent = `Fichier précédemment sélectionné : ${data[id]}. Veuillez le resélectionner pour le téléverser.`;
                        const oldInfo = el.parentElement.querySelector('.file-reselect-info');
                        if (oldInfo) oldInfo.remove();
                        el.parentElement.insertBefore(infoSpan, el.nextSibling);
                    }
                } else {
                    el.value = data[id];
                }
            }
        });
    }

    function clearData() {
        if (confirm("Êtes-vous sûr de vouloir effacer toutes les données saisies ? Cette action est irréversible.")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }

    // --- NOUVEAU : GESTION DE L'UPLOAD VERS CLOUDINARY ---
    function setupCloudinaryUploads() {
        // !!! IMPORTANT !!!
        // Remplacez ces valeurs par vos propres informations Cloudinary
        const CLOUD_NAME = 'dbihs2rzm';
        const UPLOAD_PRESET = 'atelier-clarte-dev-perso-upload';
        
        const fileInputs = document.querySelectorAll('input[type="file"][data-cloudinary-field]');

        fileInputs.forEach(fileInput => {
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const hiddenInputId = event.target.dataset.cloudinaryField;
                const hiddenInput = document.getElementById(hiddenInputId);
                const statusElement = document.getElementById(`status-${hiddenInputId}`);

                if (!hiddenInput || !statusElement) {
                    console.error(`Éléments manquants pour l'upload : ${hiddenInputId}`);
                    return;
                }

                // Réinitialiser le statut et le champ caché
                statusElement.className = 'upload-status uploading';
                statusElement.textContent = 'Téléversement en cours...';
                hiddenInput.value = '';

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);

                const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

                fetch(url, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.secure_url) {
                        statusElement.className = 'upload-status success';
                        statusElement.textContent = 'Téléversement réussi !';
                        hiddenInput.value = data.secure_url;
                        
                        // Déclencher un événement 'input' sur le champ caché pour que les résumés et la sauvegarde se mettent à jour
                        hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));

                    } else {
                        throw new Error(data.error.message || 'Erreur inconnue lors du téléversement.');
                    }
                })
                .catch(error => {
                    console.error('Erreur Cloudinary:', error);
                    statusElement.className = 'upload-status error';
                    statusElement.textContent = `Erreur : ${error.message}`;
                    hiddenInput.value = '';
                });
            });
        });
    }

    // --- GESTION DU DÉFILEMENT FLUIDE ---
    const startButton = document.querySelector('.cta-button');
    if (startButton) {
        startButton.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // --- FONCTIONS DE GESTION DE LA PROGRESSION ---
    function getSectionStatus(section) {
        if (section.id === 'section-15-conclusion') return 'todo';
        
        if (section.isOptional) {
            const naCheckbox = document.getElementById(`toggle-${section.id}-na`);
            if (naCheckbox && naCheckbox.checked) return 'completed';
        }

        if (section.keyFields.length === 0) return 'completed';

        const filledFields = section.keyFields.filter(fieldId => {
            const el = document.getElementById(fieldId);
            if (!el) return false;
            // Pour les fichiers, on vérifie le champ caché qui contient l'URL
            if (el.dataset.cloudinaryField) {
                 const hiddenInput = document.getElementById(el.dataset.cloudinaryField);
                 return hiddenInput && hiddenInput.value.trim() !== '';
            }
            if (el.type === 'file') { // Fallback pour les champs fichiers non-cloudinary
                const hiddenInputId = el.dataset.cloudinaryField;
                if(hiddenInputId) {
                    const hiddenInput = document.getElementById(hiddenInputId);
                    return hiddenInput && hiddenInput.value.trim() !== '';
                }
                return el.files.length > 0;
            }
            if (el.type === 'radio' || el.type === 'checkbox') {
                const groupName = el.name;
                return !!document.querySelector(`input[name="${groupName}"]:checked`);
            }
            return el.value.trim() !== '';
        }).length;

        if (filledFields === section.keyFields.length) return 'completed';
        if (filledFields > 0) return 'inprogress';
        return 'todo';
    }

    function updateAllProgressVisuals() {
        updateProgressTracker();
        updateVerticalNavStatus();
    }

    function updateProgressTracker() {
        const progressTrackerContainer = document.getElementById('progress-tracker');
        if (!progressTrackerContainer) return;
        SECTIONS_CONFIG.forEach(section => {
            const item = document.getElementById(`progress-item-${section.id}`);
            if (!item) return;
            const status = getSectionStatus(section);
            item.className = 'progress-item'; // Reset classes
            item.classList.add(`status-${status}`);
            const iconEl = item.querySelector('.status-icon');
            const statusTextEl = item.querySelector('.progress-text span');
            switch (status) {
                case 'completed': iconEl.innerHTML = '✔'; statusTextEl.textContent = 'Terminé'; break;
                case 'inprogress': iconEl.innerHTML = '…'; statusTextEl.textContent = 'En cours'; break;
                default: iconEl.innerHTML = '○'; statusTextEl.textContent = 'À commencer'; break;
            }
        });
    }

    function updateVerticalNavStatus() {
        const verticalNavContainer = document.getElementById('vertical-nav');
        if (!verticalNavContainer) return;
        SECTIONS_CONFIG.forEach(section => {
            const item = document.getElementById(`vnav-item-${section.id}`);
            if (!item) return;
            const status = getSectionStatus(section);
            item.className = ''; // Reset classes
            item.classList.add(`status-${status}`);
        });
    }

    function initializeProgressTracker() {
        const progressTrackerContainer = document.getElementById('progress-tracker');
        if (!progressTrackerContainer) return;
        progressTrackerContainer.innerHTML = '';
        SECTIONS_CONFIG.forEach(section => {
            const item = document.createElement('a');
            item.id = `progress-item-${section.id}`;
            item.href = `#${section.id}`;
            item.className = 'progress-item status-todo';
            item.innerHTML = `<span class="status-icon">○</span><div class="progress-text"><strong>${section.name.split(':')[0]}</strong><span>À commencer</span></div>`;
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            progressTrackerContainer.appendChild(item);
        });
    }

    function initializeVerticalNav() {
        const verticalNavContainer = document.getElementById('vertical-nav');
        if (!verticalNavContainer) return;
        const ul = document.createElement('ul');
        SECTIONS_CONFIG.forEach(section => {
            const li = document.createElement('li');
            li.id = `vnav-item-${section.id}`;
            const a = document.createElement('a');
            a.href = `#${section.id}`;
            a.setAttribute('aria-label', `Aller à la section ${section.name.split(':')[0]}`);
            a.innerHTML = `<span class="nav-dot"></span><span class="nav-tooltip">${section.name.split(':')[0]}</span>`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        verticalNavContainer.appendChild(ul);
    }

    function setupVerticalNavObserver() {
        const verticalNavContainer = document.getElementById('vertical-nav');
        if (!verticalNavContainer) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const navItem = document.querySelector(`#vnav-item-${entry.target.id}`);
                if (navItem) {
                    if (entry.isIntersecting) {
                        verticalNavContainer.querySelectorAll('li.active').forEach(item => item.classList.remove('active'));
                        navItem.classList.add('active');
                    }
                }
            });
        }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });

        SECTIONS_CONFIG.forEach(section => {
            const sectionEl = document.getElementById(section.id);
            if (sectionEl) observer.observe(sectionEl);
        });
    }
    
    // --- GESTION DES CHAMPS CONDITIONNELS ---
    function setupConditionalFields() {
        // Section Héros
        document.querySelectorAll('input[name="hero-visual-choice"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('hero-image-group').style.display = (this.value === 'image') ? 'block' : 'none';
                document.getElementById('hero-color-group').style.display = (this.value === 'color') ? 'block' : 'none';
            });
        });
        // Section Contact
        document.querySelectorAll('input[name="contact-map-choice"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('contact-map-details-container').style.display = (this.value === 'yes') ? 'block' : 'none';
            });
        });
        // Section Architecture
        document.querySelectorAll('input[name="architecture-plan-choice"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('custom-order-inputs').style.display = (this.value === 'Custom') ? 'block' : 'none';
            });
        });
    }
    
    // --- GESTION DE LA PERSONNALISATION ---
    function setupPersonalization() {
        const nameInput = document.getElementById('client-name-input');
        const dateInput = document.getElementById('client-date-input');
        const nameDisplay = document.getElementById('client-name-display');

        function updateName() {
            const name = nameInput.value.trim();
            nameDisplay.textContent = name || '[Nom du Client]';
        }
        
        if(nameInput && dateInput && nameDisplay) {
            nameInput.addEventListener('input', updateName);
            // Initial load
            updateName();
        }
    }

    // --- SYNCHRONISATION DES RÉSUMÉS ---
    function setupSync(inputId, outputId, optionalRowId = null) {
        const inputElement = document.getElementById(inputId);
        const outputElement = document.getElementById(outputId);
        const optionalRow = optionalRowId ? document.getElementById(optionalRowId) : null;

        if (inputElement && outputElement) {
            const update = () => {
                const value = inputElement.value;
                // Pour les champs cachés (Cloudinary), on affiche un message plus clair
                if (inputElement.type === 'hidden' && value.startsWith('http')) {
                    outputElement.innerText = `Image téléversée avec succès.`;
                } else {
                    outputElement.innerText = value;
                }
                if (optionalRow) {
                    optionalRow.style.display = value.trim() !== '' ? 'table-row' : 'none';
                }
            };
            // On écoute 'input' pour les champs texte/cachés, et 'change' pour les autres
            const eventType = (inputElement.tagName === 'TEXTAREA' || inputElement.type === 'text' || inputElement.type === 'hidden') ? 'input' : 'change';
            inputElement.addEventListener(eventType, update);
            update();
        }
    }

    function initializeSummaries() {
        // Section Fondations
        setupSync('domain-choice-final', 'summary-domain-choice');

        // Section 1: Héros
        setupSync('hero-title-1', 'summary-hero-title-1');
        setupSync('hero-subtitle-1', 'summary-hero-subtitle-1');
        setupSync('hero-title-2', 'summary-hero-title-2', 'summary-row-title-2');
        setupSync('hero-subtitle-2', 'summary-hero-subtitle-2', 'summary-row-subtitle-2');
        setupSync('hero-cta-primary', 'summary-hero-cta-primary');
        setupSync('hero-cta-secondary', 'summary-hero-cta-secondary', 'summary-row-cta-secondary');
        
        function updateHeroVisualSummary() {
            const selectedRadio = document.querySelector('input[name="hero-visual-choice"]:checked');
            const hiddenImageInput = document.getElementById('hero-image-upload');
            const colorInput = document.getElementById('hero-color-choice');
            const output = document.getElementById('summary-hero-visual');
            if (!output) return;
            if (!selectedRadio) {
                output.textContent = '';
                return;
            }
            if (selectedRadio.value === 'image') {
                output.textContent = hiddenImageInput.value ? `Image téléversée.` : 'Image choisie (en attente de téléversement)';
            } else {
                output.textContent = `Fond de couleur : ${colorInput.value || 'Non spécifié'}`;
            }
        }
        document.querySelectorAll('input[name="hero-visual-choice"], #hero-image-upload, #hero-color-choice').forEach(el => {
            const event = (el.type === 'radio' || el.type === 'hidden') ? 'input' : 'change';
            el.addEventListener(event, updateHeroVisualSummary);
        });

        // Section 2: À Propos
        setupSync('about-title-final', 'summary-about-title');
        setupSync('about-story-final', 'summary-about-story');
        setupSync('about-image-upload', 'summary-about-image');


        // Section 3: Accompagnements (Services)
        setupSync('services-title-final', 'summary-services-title');
        function setupOfferSync(num) {
            const inputs = [`service-${num}-name`, `service-${num}-description`, `service-${num}-detail-points`, `service-${num}-price`, `service-${num}-detail-cta`];
            const summaryRow = document.getElementById(`summary-row-service-${num}`);
            const summaryOutput = document.getElementById(`summary-service-${num}`);
            function update() {
                const name = document.getElementById(`service-${num}-name`).value.trim();
                if (!name) {
                    summaryRow.style.display = 'none';
                    return;
                }
                summaryRow.style.display = 'table-row';
                const desc = document.getElementById(`service-${num}-description`).value.trim();
                const points = document.getElementById(`service-${num}-detail-points`).value.trim();
                const price = document.getElementById(`service-${num}-price`).value.trim();
                const cta = document.getElementById(`service-${num}-detail-cta`).value.trim();
                summaryOutput.innerText = `Nom : ${name}\nDescription : ${desc}\nDéroulé : ${points}\nTarif/Durée : ${price}${cta ? `\nBouton : "${cta}"` : ''}`;
            }
            inputs.forEach(id => document.getElementById(id)?.addEventListener('input', update));
            update();
        }
        [1, 2, 3].forEach(setupOfferSync);

        // Section 4: Approche
        setupSync('approach-title-final', 'summary-approach-title');
        setupSync('approach-intro-text', 'summary-approach-intro');
        function setupApproachStepsSync() {
            const summaryRow = document.getElementById('summary-row-approach-steps');
            const summaryOutput = document.getElementById('summary-approach-steps');
            function update() {
                const steps = [];
                let hasContent = false;
                for (let i = 1; i <= 3; i++) {
                    const title = document.getElementById(`approach-step-${i}-title`)?.value.trim();
                    if (title) {
                        hasContent = true;
                        const desc = document.getElementById(`approach-step-${i}-desc`)?.value.trim();
                        steps.push(`Étape ${i}: ${title}\n- ${desc}`);
                    }
                }
                summaryRow.style.display = hasContent ? 'table-row' : 'none';
                summaryOutput.innerText = steps.join('\n\n');
            }
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`approach-step-${i}-title`)?.addEventListener('input', update);
                document.getElementById(`approach-step-${i}-desc`)?.addEventListener('input', update);
            }
            update();
        }
        setupApproachStepsSync();

        // Section 5: Galerie (Portfolio)
        setupSync('portfolio-title-final', 'summary-portfolio-title');
        function setupPortfolioSync() {
            const summaryRow = document.getElementById('summary-row-portfolio-projects');
            const summaryOutput = document.getElementById('summary-portfolio-projects');
            function update() {
                const images = [];
                let hasContent = false;
                for (let i = 1; i <= 3; i++) {
                    const hiddenImageInput = document.getElementById(`portfolio-${i}-image`);
                    const legendInput = document.getElementById(`portfolio-${i}-title`);
                    if (hiddenImageInput?.value) {
                        hasContent = true;
                        let text = `Image ${i}: Téléversée avec succès.`;
                        if (legendInput?.value.trim()) text += `\n- Légende: ${legendInput.value.trim()}`;
                        images.push(text);
                    }
                }
                summaryRow.style.display = hasContent ? 'table-row' : 'none';
                summaryOutput.innerText = images.join('\n\n');
            }
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`portfolio-${i}-image`)?.addEventListener('input', update);
                document.getElementById(`portfolio-${i}-title`)?.addEventListener('input', update);
            }
            update();
        }
        setupPortfolioSync();

        // Section 6: Témoignages
        setupSync('testimonials-title-final', 'summary-testimonials-title');
        function setupTestimonialSync(num) {
            const summaryRow = document.getElementById(`summary-row-testimonial-${num}`);
            const summaryOutput = document.getElementById(`summary-testimonial-${num}`);
            function update() {
                const text = document.getElementById(`testimonial-${num}-text`).value.trim();
                const name = document.getElementById(`testimonial-${num}-name`).value.trim();
                if (!text && !name) {
                    summaryRow.style.display = 'none';
                    return;
                }
                summaryRow.style.display = 'table-row';
                const title = document.getElementById(`testimonial-${num}-title`).value.trim();
                const photoUrl = document.getElementById(`testimonial-${num}-photo`).value;
                summaryOutput.innerText = `De : ${name} (${title})\nTexte : "${text}"\nPhoto : ${photoUrl ? 'Téléversée' : 'Non fournie'}`;
            }
            [`testimonial-${num}-text`, `testimonial-${num}-name`, `testimonial-${num}-title`, `testimonial-${num}-photo`].forEach(id => document.getElementById(id).addEventListener('input', update));
            update();
        }
        [1, 2, 3].forEach(setupTestimonialSync);

        // Section 7: FAQ
        setupSync('faq-title-final', 'summary-faq-title');
        function setupFaqSync() {
            const summaryRow = document.getElementById('summary-row-faq-pairs');
            const summaryOutput = document.getElementById('summary-faq-pairs');
            function update() {
                const pairs = [];
                let hasContent = false;
                for (let i = 1; i <= 4; i++) {
                    const q = document.getElementById(`faq-q-${i}`)?.value.trim();
                    if (q) {
                        hasContent = true;
                        const a = document.getElementById(`faq-a-${i}`)?.value.trim();
                        pairs.push(`Q${i}: ${q}\nA${i}: ${a}`);
                    }
                }
                summaryRow.style.display = hasContent ? 'table-row' : 'none';
                summaryOutput.innerText = pairs.join('\n\n');
            }
            for (let i = 1; i <= 4; i++) {
                document.getElementById(`faq-q-${i}`)?.addEventListener('input', update);
                document.getElementById(`faq-a-${i}`)?.addEventListener('input', update);
            }
            update();
        }
        setupFaqSync();

        // Section 8: Blog
        setupSync('blog-title-final', 'summary-blog-title');
        function setupBlogSync() {
            const pillarsSummary = document.getElementById('summary-blog-pillars');
            const ideasSummary = document.getElementById('summary-blog-ideas');
            const ideasSummaryRow = document.getElementById('summary-row-blog-ideas');
            function update() {
                const pillars = [document.getElementById('blog-pillar-1').value.trim(), document.getElementById('blog-pillar-2').value.trim(), document.getElementById('blog-pillar-3').value.trim()].filter(Boolean);
                pillarsSummary.innerText = pillars.join('\n') || 'Non défini';
                const ideas = [document.getElementById('blog-pillar1-idea1').value.trim(), document.getElementById('blog-pillar1-idea2').value.trim()].filter(Boolean);
                ideasSummaryRow.style.display = ideas.length > 0 ? 'table-row' : 'none';
                ideasSummary.innerText = ideas.map(idea => `• ${idea}`).join('\n');
            }
            ['blog-pillar-1', 'blog-pillar-2', 'blog-pillar-3', 'blog-pillar1-idea1', 'blog-pillar1-idea2'].forEach(id => document.getElementById(id).addEventListener('input', update));
            update();
        }
        setupBlogSync();

        // Section 9: Lead Magnet
        function setupLeadMagnetSync() {
            const idea1 = document.getElementById('leadmagnet-idea-q1');
            const idea2 = document.getElementById('leadmagnet-idea-q2');
            const format = document.getElementById('leadmagnet-format');
            const title = document.getElementById('leadmagnet-title');
            const subtitle = document.getElementById('leadmagnet-subtitle');
            const summaryIdea = document.getElementById('summary-leadmagnet-idea');
            const summaryFormat = document.getElementById('summary-leadmagnet-format');
            const summaryTitle = document.getElementById('summary-leadmagnet-title');
            const summarySubtitle = document.getElementById('summary-leadmagnet-subtitle');

            function update() {
                if (!summaryIdea) return;
                const ideasText = [idea1.value.trim(), idea2.value.trim()].filter(Boolean).join('\n---\n');
                summaryIdea.innerText = ideasText || '';
                summaryFormat.innerText = format.value.trim();
                summaryTitle.innerText = title.value.trim();
                summarySubtitle.innerText = subtitle.value.trim();
            }
            [idea1, idea2, format, title, subtitle].forEach(el => el?.addEventListener('input', update));
            update();
        }
        setupLeadMagnetSync();

        // Section 10: Booking
        setupSync('booking-title-final', 'summary-booking-title');
        setupSync('booking-subtitle-final', 'summary-booking-subtitle');
        setupSync('booking-event-name', 'summary-booking-event-name');
        setupSync('booking-event-duration', 'summary-booking-event-duration');
        setupSync('booking-event-description', 'summary-booking-event-description');
        function setupBookingQuestionsSync() {
            const q1 = document.getElementById('booking-q1');
            const q2 = document.getElementById('booking-q2');
            const output = document.getElementById('summary-booking-questions');
            function update() {
                const questions = [q1.value.trim(), q2.value.trim()].filter(q => q);
                output.innerText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
            }
            [q1, q2].forEach(el => el.addEventListener('input', update));
            update();
        }
        setupBookingQuestionsSync();

        // Section 11: Contact
        setupSync('contact-title-final', 'summary-contact-title');
        setupSync('contact-intro-text', 'summary-contact-intro');
        setupSync('contact-reception-email', 'summary-contact-reception-email');
        setupSync('contact-confirm-message', 'summary-contact-confirm-message');
        function updateContactDetails() {
            const address = document.getElementById('contact-address').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const hours = document.getElementById('contact-hours').value.trim();
            document.getElementById('summary-contact-details').innerText = [address, phone, email, hours].filter(Boolean).join('\n');
        }
        ['contact-address', 'contact-phone', 'contact-email', 'contact-hours'].forEach(id => document.getElementById(id).addEventListener('input', updateContactDetails));
        
        function updateContactSocials() {
            const linkedin = document.getElementById('contact-social-linkedin').value.trim();
            const insta = document.getElementById('contact-social-instagram').value.trim();
            const fb = document.getElementById('contact-social-facebook').value.trim();
            const socials = [];
            if (linkedin) socials.push(`LinkedIn : ${linkedin}`);
            if (insta) socials.push(`Instagram : ${insta}`);
            if (fb) socials.push(`Facebook : ${fb}`);
            document.getElementById('summary-contact-socials').innerText = socials.join('\n') || 'Non renseignés';
        }
        ['contact-social-linkedin', 'contact-social-instagram', 'contact-social-facebook'].forEach(id => document.getElementById(id).addEventListener('input', updateContactSocials));
        
        function setupContactMapSync() {
            const output = document.getElementById('summary-contact-map');
            function update() {
                const choice = document.querySelector('input[name="contact-map-choice"]:checked')?.value;
                if (choice === 'yes') {
                    const address = document.getElementById('contact-map-address').value.trim();
                    const transport = document.getElementById('contact-access-transport').value.trim();
                    const parking = document.getElementById('contact-access-parking').value.trim();
                    const details = document.getElementById('contact-access-details').value.trim();
                    const pmr = document.getElementById('contact-access-pmr').value.trim();
                    let summaryLines = [`Oui - Adresse : ${address || 'Non spécifiée'}`];
                    if (transport) summaryLines.push(`Transports : ${transport}`);
                    if (parking) summaryLines.push(`Stationnement : ${parking}`);
                    if (details) summaryLines.push(`Dernier mètre : ${details}`);
                    if (pmr) summaryLines.push(`Accessibilité : ${pmr}`);
                    output.innerText = summaryLines.join('\n');
                } else if (choice === 'no') {
                    output.textContent = 'Non';
                } else {
                    output.textContent = '';
                }
            }
            document.querySelectorAll('input[name="contact-map-choice"], #contact-map-address, #contact-access-transport, #contact-access-parking, #contact-access-details, #contact-access-pmr').forEach(el => {
                const event = el.type === 'radio' ? 'change' : 'input';
                el.addEventListener(event, update);
            });
            update();
        }
        setupContactMapSync();

        // Section 12: Architecture
        function setupArchitectureSync() {
            const summaryPlan = document.getElementById('summary-architecture-plan');
            const summaryOrder = document.getElementById('summary-architecture-order');
            
            function getOrderString(orderArray) {
                const filledSections = orderArray
                    .map(key => SECTIONS_CONFIG.find(s => s.key === key))
                    .filter(section => section && section.isFilled());
                
                const finalOrder = ['Héros', ...filledSections.map(s => s.name.split(':')[0].trim())];
                const contactSection = SECTIONS_CONFIG.find(s => s.key === 'contact');
                if (contactSection && contactSection.isFilled()) {
                    finalOrder.push(contactSection.name.split(':')[0].trim());
                }
                return finalOrder.map((name, index) => `${index + 1}. ${name}`).join('\n');
            }
            function update() {
                const choice = document.querySelector('input[name="architecture-plan-choice"]:checked')?.value;
                let planText = '', orderText = '';
                if (choice === 'B') {
                    planText = 'Plan A : Le "Parcours de la Confiance"';
                    orderText = getOrderString(['about', 'services', 'approach', 'testimonials', 'faq', 'blog', 'leadmagnet', 'booking']);
                } else if (choice === 'C') {
                    planText = 'Plan B : Le "Parcours de l\'Expertise"';
                    orderText = getOrderString(['services', 'approach', 'about', 'testimonials', 'faq', 'blog', 'leadmagnet', 'booking']);
                } else if (choice === 'Custom') {
                    planText = 'Plan Personnalisé';
                    const customOrder = Object.entries({about: 'order-input-about', services: 'order-input-services', approach: 'order-input-approach', portfolio: 'order-input-portfolio', testimonials: 'order-input-testimonials', faq: 'order-input-faq', blog: 'order-input-blog', leadmagnet: 'order-input-leadmagnet', booking: 'order-input-booking'})
                        .map(([key, id]) => ({ key, order: parseInt(document.getElementById(id).value, 10) || 99 }))
                        .filter(item => SECTIONS_CONFIG.find(s => s.key === item.key)?.isFilled())
                        .sort((a, b) => a.order - b.order)
                        .map(item => item.key);
                    orderText = getOrderString(customOrder);
                }
                summaryPlan.textContent = planText;
                summaryOrder.innerText = orderText;
            }
            document.querySelectorAll('input[name="architecture-plan-choice"], .custom-order-container input').forEach(el => {
                const event = el.type === 'radio' ? 'change' : 'input';
                el.addEventListener(event, update);
            });
            update();
        }
        setupArchitectureSync();
    }

    // --- FONCTION D'INITIALISATION GLOBALE ---
    function initializeApp() {
        allFormElements = Array.from(document.querySelectorAll('input, textarea'));
        loadData();
        
        initializeProgressTracker();
        initializeVerticalNav();
        setupVerticalNavObserver();
        setupConditionalFields();
        setupPersonalization();
        setupCloudinaryUploads(); // Ajout de l'initialisation Cloudinary
        
        // NOUVEAU : Initialisation de la Lightbox
        const lightbox = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            autoplayVideos: true
        });
        
        allFormElements.forEach(input => {
            // On ne veut pas que la sélection de fichier déclenche la sauvegarde,
            // seulement le téléversement réussi (géré dans setupCloudinaryUploads)
            if (input.type !== 'file') {
                const eventType = (input.type === 'radio' || input.type === 'checkbox') ? 'change' : 'input';
                input.addEventListener(eventType, () => {
                    saveData();
                    updateAllProgressVisuals();
                });
            }
        });
        
        document.getElementById('clear-data-button')?.addEventListener('click', clearData);
        initializeSummaries();
        // Call all summary updates once on load to populate from localStorage data
        allFormElements.forEach(el => {
            const event = new Event((el.type === 'radio' || el.type === 'checkbox' || el.type === 'file') ? 'change' : 'input');
            el.dispatchEvent(event);
        });
        updateAllProgressVisuals();
        
        document.getElementById('save-pdf-button')?.addEventListener('click', () => window.print());
        document.getElementById('generate-report-button')?.addEventListener('click', generateAndPrintReport);
    }

    // --- GESTION DE L'EXPORT PDF (RAPPORT DE SYNTHÈSE) ---
    function generateStructuredData() {
        const data = {};
        const getValue = (id) => document.getElementById(id)?.value.trim() || '';
        // Modifié pour prendre la valeur du champ caché (URL Cloudinary)
        const getFileValue = (id) => document.getElementById(id)?.value.trim() || '';
        const getRadioValue = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

        data.foundations = { domain: getValue('domain-choice-final') };
        data.client = { name: getValue('client-name-input'), date: getValue('client-date-input') };
        data.hero = { title1: getValue('hero-title-1'), subtitle1: getValue('hero-subtitle-1'), cta1: getValue('hero-cta-primary'), visualType: getRadioValue('hero-visual-choice'), imageUrl: getFileValue('hero-image-upload'), color: getValue('hero-color-choice') };
        data.about = { title: getValue('about-title-final'), story: getValue('about-story-final'), imageUrl: getFileValue('about-image-upload') };
        data.services = { title: getValue('services-title-final'), offers: [] };
        for (let i = 1; i <= 3; i++) {
            const name = getValue(`service-${i}-name`);
            if (name) data.services.offers.push({ name, description: getValue(`service-${i}-description`), points: getValue(`service-${i}-detail-points`), price: getValue(`service-${i}-price`), cta: getValue(`service-${i}-detail-cta`) });
        }
        data.approach = { title: getValue('approach-title-final'), intro: getValue('approach-intro-text'), steps: [] };
        for (let i = 1; i <= 3; i++) {
            const title = getValue(`approach-step-${i}-title`);
            if (title) data.approach.steps.push({ title, description: getValue(`approach-step-${i}-desc`) });
        }
        data.portfolio = { title: getValue('portfolio-title-final'), images: [] };
        for (let i = 1; i <= 3; i++) {
            const imageUrl = getFileValue(`portfolio-${i}-image`);
            if (imageUrl) data.portfolio.images.push({ url: imageUrl, legend: getValue(`portfolio-${i}-title`) });
        }
        data.testimonials = { title: getValue('testimonials-title-final'), list: [] };
        for (let i = 1; i <= 3; i++) {
            const name = getValue(`testimonial-${i}-name`);
            if (name) data.testimonials.list.push({ name, title: getValue(`testimonial-${i}-title`), text: getValue(`testimonial-${i}-text`), photoUrl: getFileValue(`testimonial-${i}-photo`) });
        }
        data.faq = { title: getValue('faq-title-final'), pairs: [] };
        for (let i = 1; i <= 4; i++) {
            const q = getValue(`faq-q-${i}`);
            if (q) data.faq.pairs.push({ question: q, answer: getValue(`faq-a-${i}`) });
        }
        data.blog = { enabled: !document.getElementById('toggle-section-8-na')?.checked, title: getValue('blog-title-final'), pillars: [getValue('blog-pillar-1'), getValue('blog-pillar-2'), getValue('blog-pillar-3')].filter(Boolean), ideas: [getValue('blog-pillar1-idea1'), getValue('blog-pillar1-idea2')].filter(Boolean) };
        const leadMagnetIdeas = [getValue('leadmagnet-idea-q1'), getValue('leadmagnet-idea-q2')].filter(Boolean).join('\n---\n');
        data.leadmagnet = { enabled: !document.getElementById('toggle-section-9-na')?.checked, brainstorm: leadMagnetIdeas, format: getValue('leadmagnet-format'), title: getValue('leadmagnet-title'), subtitle: getValue('leadmagnet-subtitle') };
        data.booking = { title: getValue('booking-title-final'), subtitle: getValue('booking-subtitle-final'), event: { name: getValue('booking-event-name'), duration: getValue('booking-event-duration'), description: getValue('booking-event-description'), questions: [getValue('booking-q1'), getValue('booking-q2')].filter(Boolean) } };
        data.contact = { title: getValue('contact-title-final'), intro: getValue('contact-intro-text'), formEmail: getValue('contact-reception-email'), formConfirm: getValue('contact-confirm-message'), details: { address: getValue('contact-address'), phone: getValue('contact-phone'), email: getValue('contact-email'), hours: getValue('contact-hours') }, socials: { linkedin: getValue('contact-social-linkedin'), instagram: getValue('contact-social-instagram'), facebook: getValue('contact-social-facebook') }, map: { enabled: getRadioValue('contact-map-choice') === 'yes', address: getValue('contact-map-address'), transport: getValue('contact-access-transport'), parking: getValue('contact-access-parking'), details: getValue('contact-access-details'), pmr: getValue('contact-access-pmr') } };
        data.architecture = { plan: getRadioValue('architecture-plan-choice') };
        return data;
    }

    function generateAndPrintReport() {
        const data = generateStructuredData();
        let reportHTML = '';
        const generateField = (label, value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return `<div class="report-field"><strong>${label}</strong><div class="value empty">Non renseigné</div></div>`;
            const displayValue = Array.isArray(value) ? `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>` : value;
            return `<div class="report-field"><strong>${label}</strong><div class="value">${displayValue}</div></div>`;
        };
        
        reportHTML += `<div class="report-section"><h2>Fondations : Nom de Domaine</h2>${generateField('Nom de Domaine Choisi', data.foundations.domain)}</div>`;
        reportHTML += `<div class="report-section"><h2>Section 1 : Héros</h2>${generateField('Titre', data.hero.title1)}${generateField('Sous-titre', data.hero.subtitle1)}${generateField('Bouton', data.hero.cta1)}</div>`;
        reportHTML += `<div class="report-section"><h2>Section 2 : À Propos</h2>${generateField('Titre', data.about.title)}${generateField('Récit', data.about.story)}${generateField('Image (URL)', data.about.imageUrl)}</div>`;
        let servicesHTML = data.services.offers.map((o, i) => `<div class="report-subsection"><h3>Accompagnement ${i+1}</h3>${generateField('Nom', o.name)}${generateField('Description', o.description)}${generateField('Tarif/Durée', o.price)}</div>`).join('');
        reportHTML += `<div class="report-section"><h2>Section 3 : Accompagnements</h2>${generateField('Titre', data.services.title)}${servicesHTML}</div>`;
        let approachHTML = data.approach.steps.map((s, i) => `<div class="report-subsection"><h3>Étape ${i+1}</h3>${generateField('Titre', s.title)}${generateField('Description', s.description)}</div>`).join('');
        reportHTML += `<div class="report-section"><h2>Section 4 : Mon Approche</h2>${generateField('Titre', data.approach.title)}${generateField('Intro', data.approach.intro)}${approachHTML}</div>`;
        let portfolioHTML = data.portfolio.images.map((img, i) => `<div class="report-subsection"><h3>Image ${i+1}</h3>${generateField('URL', img.url)}${generateField('Légende', img.legend)}</div>`).join('');
        reportHTML += `<div class="report-section"><h2>Section 5 : Galerie</h2>${generateField('Titre', data.portfolio.title)}${portfolioHTML}</div>`;
        let testimonialsHTML = data.testimonials.list.map((t, i) => `<div class="report-subsection"><h3>Témoignage ${i+1}</h3>${generateField('Nom', `${t.name} (${t.title})`)}${generateField('Texte', t.text)}</div>`).join('');
        reportHTML += `<div class="report-section"><h2>Section 6 : Témoignages</h2>${generateField('Titre', data.testimonials.title)}${testimonialsHTML}</div>`;
        let faqHTML = data.faq.pairs.map((p, i) => `<div class="report-subsection"><h3>Q&R ${i+1}</h3>${generateField('Question', p.question)}${generateField('Réponse', p.answer)}</div>`).join('');
        reportHTML += `<div class="report-section"><h2>Section 7 : FAQ</h2>${generateField('Titre', data.faq.title)}${faqHTML}</div>`;
        
        if(data.blog.enabled && data.blog.title) reportHTML += `<div class="report-section"><h2>Section 8 : Blog (Optionnel)</h2>${generateField('Titre', data.blog.title)}${generateField('Piliers', data.blog.pillars.join(', '))}${generateField('Idées', data.blog.ideas)}</div>`;
        if(data.leadmagnet.enabled && data.leadmagnet.title) reportHTML += `<div class="report-section"><h2>Section 9 : Ressource Offerte (Optionnel)</h2>${generateField('Titre', data.leadmagnet.title)}${generateField('Promesse', data.leadmagnet.subtitle)}${generateField('Format', data.leadmagnet.format)}${generateField('Idées de base', data.leadmagnet.brainstorm)}</div>`;

        reportHTML += `<div class="report-section"><h2>Section 10 : Prise de RDV</h2>${generateField('Titre', data.booking.title)}${generateField('Sous-titre', data.booking.subtitle)}${generateField('Nom de la séance', data.booking.event.name)}</div>`;
        let contactDetailsHTML = `${generateField('Adresse', data.contact.details.address)}${generateField('Téléphone', data.contact.details.phone)}${generateField('Email', data.contact.details.email)}${generateField('Horaires', data.contact.details.hours)}`;
        let mapDetailsHTML = data.contact.map.enabled ? `${generateField('Adresse sur carte', data.contact.map.address)}${generateField('Transports', data.contact.map.transport)}${generateField('Parking', data.contact.map.parking)}${generateField('Détails d\'accès', data.contact.map.details)}${generateField('Accessibilité PMR', data.contact.map.pmr)}` : generateField('Carte affichée', 'Non');
        reportHTML += `<div class="report-section"><h2>Section 11 : Contact</h2>${generateField('Titre', data.contact.title)}${generateField('Intro', data.contact.intro)}${generateField('Email de réception', data.contact.formEmail)}${contactDetailsHTML}${mapDetailsHTML}</div>`;
        reportHTML += `<div class="report-section"><h2>Section 12 : Architecture</h2>${generateField('Plan choisi', data.architecture.plan === 'B' ? 'Plan A: Parcours de la Confiance' : (data.architecture.plan === 'C' ? 'Plan B: Parcours de l\'Expertise' : 'Plan Personnalisé'))}</div>`;

        const finalPageHTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport de Synthèse - Briefing Clartem</title><style>.report-body{font-family:'Georgia',serif;line-height:1.6;color:#333;padding:2rem;max-width:800px;margin:auto}.report-header{text-align:center;border-bottom:2px solid #eee;padding-bottom:1rem;margin-bottom:2rem}.report-header h1{color:#19224F}.report-section{margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid #eee}.report-section h2{color:#19224F}.report-field{margin-bottom:1.2rem}.report-field strong{display:block;color:#555}.report-field .value{background:#f9f9f9;padding:.8rem;border-radius:4px;border-left:3px solid #3498DB;white-space:pre-wrap;word-wrap:break-word} .report-field .value ul{margin:0;padding-left:20px} .report-field .value.empty{color:#999;font-style:italic;border-left-color:#ccc;} .report-subsection{margin-top:1.5rem;padding:1rem;border:1px solid #e0e0e0;border-radius:6px;background-color:#fafafa;} .report-subsection h3{font-size:1.2rem;color:#333;margin-top:0;margin-bottom:1rem;} @media print{.report-body{box-shadow:none;margin:0;max-width:100%}}</style></head><body class="report-body"><header class="report-header"><h1>Rapport de Synthèse du Briefing</h1><p>Préparé pour : ${data.client.name || 'N/A'} - Le ${data.client.date || new Date().toLocaleDateString('fr-FR')}</p></header><main>${reportHTML}</main><script>window.onload=window.print</script></body></html>`;
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(finalPageHTML);
        reportWindow.document.close();
    }
    
    // --- DÉMARRAGE ---
    initializeApp();
});
