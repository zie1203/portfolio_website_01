// --- START OF FILE script.js ---

// Using dynamic import for gallery.js within the DOMContentLoaded listener instead of top-level
let initGallery = () => { /* console.warn("initGallery function was called but gallery module might not have been loaded.") */ }; // Default placeholder

/**
 * Toggles the visibility of the mobile navigation menu (hamburger menu).
 * Called via event listener added in DOMContentLoaded.
 */
function toggleMenu() {
    const navContainer = document.getElementById('hamburger-nav');
    if (!navContainer) return;
    const menu = navContainer.querySelector(".menu-links");
    const icon = navContainer.querySelector(".hamburger-icon");
    if (menu && icon) {
        menu.classList.toggle("open");
        icon.classList.toggle("open");
    } else {
        console.error("Hamburger menu elements (.menu-links or .hamburger-icon) not found within #hamburger-nav.");
    }
}

/**
 * Sets up pagination for a skills box specified by its ID.
 * Called conditionally in DOMContentLoaded.
 */
function setupSkillsPagination(boxId, itemsPerPage = 4) {
    const skillBox = document.getElementById(boxId);
    if (!skillBox) return;
    const articleContainer = skillBox.querySelector('.article-list-container');
    const paginationControls = skillBox.querySelector('.pagination-controls');
    if (!articleContainer || !paginationControls) return;
    const articles = articleContainer.querySelectorAll('article');
    const paginatedArticles = Array.from(articles);
    if (paginatedArticles.length === 0) { paginationControls.style.display = 'none'; return; }
    const totalPages = Math.ceil(paginatedArticles.length / itemsPerPage);
    function showSkillPage(pageNumber) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        paginatedArticles.forEach((article, index) => {
            article.style.display = (index >= startIndex && index < endIndex) ? 'flex' : 'none';
        });
        if (paginationControls && totalPages > 1) {
            const allDots = paginationControls.querySelectorAll('.skills-pagination-dot');
            allDots.forEach(d => { d.classList.toggle('active', parseInt(d.dataset.pageTarget, 10) === pageNumber); });
        }
    }
    paginationControls.innerHTML = '';
    if (totalPages > 1) {
        paginationControls.style.display = 'flex';
        for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('skills-pagination-dot'); dot.dataset.pageTarget = i;
            if (i === 1) dot.classList.add('active');
            dot.addEventListener('click', () => showSkillPage(i));
            paginationControls.appendChild(dot);
        }
    } else { paginationControls.style.display = 'none'; }
    showSkillPage(1);
}


// === REFACTORED: Multi-Slide Modal Functionality ===
function initializeMultiSlideModal(triggerId, modalId) {
    const modal = document.getElementById(modalId);
    const triggerBox = document.getElementById(triggerId);
    if (!modal || !triggerBox) return; // Exit if elements missing

    // Find elements *within this specific modal*
    const closeBtn = modal.querySelector('.modal-close-btn');
    const prevBtn = modal.querySelector('.modal-prev-btn');
    const nextBtn = modal.querySelector('.modal-next-btn');
    const slides = modal.querySelectorAll('.modal-slide');
    const totalSlides = slides?.length || 0;
    let currentSlideIndex = 1; // State specific to this modal instance

    function showSlide(index) {
        if (!slides || slides.length === 0 || index < 1 || index > totalSlides) return;
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index - 1].classList.add('active');
        currentSlideIndex = index;
        updateArrowStates(); // Uses variables scoped within this init function
    }

    function changeSlide(direction) {
        const newIndex = currentSlideIndex + direction;
        if (newIndex >= 1 && newIndex <= totalSlides) showSlide(newIndex);
    }

    function updateArrowStates() { // Uses local prevBtn, nextBtn, totalSlides
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = (currentSlideIndex === 1);
        nextBtn.disabled = (currentSlideIndex === totalSlides);
    }

    function openModal() {
        modal.classList.add('visible');
        showSlide(1); // Reset to first slide on open
    }

    function closeModal() {
        modal.classList.remove('visible');
    }

    // Add Listeners for THIS modal instance
    triggerBox.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    // Initial setup for arrows
    if (totalSlides > 0) {
       updateArrowStates();
    } else {
        if(prevBtn) prevBtn.disabled = true;
        if(nextBtn) nextBtn.disabled = true;
    }
    // console.log(`[DEBUG] Multi-Slide Modal Initialized for: ${modalId}`); // Optional
}


// --- Screen Off Transition Functionality ---
function initializeScreenOffTransition() {
    const initialLayer = document.getElementById('initial-layer');
    const revealedContent = document.querySelector('#real-me-peel .revealed-content');
    const bodyElement = document.querySelector('body.realme-page-body'); // Keep targetting specific body class
    if (initialLayer && revealedContent && bodyElement) {
        const handleScreenOffClick = () => {
            if (initialLayer.classList.contains('turning-off')) return;
            initialLayer.classList.add('turning-off');
            bodyElement.classList.add('night-mode');
            // Optionally add to document.body as well IF styles depend on it globally
            // document.body.classList.add('night-mode');
            revealedContent.classList.add('visible');
        };
        initialLayer.addEventListener('click', handleScreenOffClick);
        const typingText = initialLayer.querySelector('.typing-text');
        if (typingText) {
            typingText.addEventListener('animationend', (event) => {
                if (event.animationName === 'typing') {
                    // Stop the caret blinking after typing finishes
                    typingText.style.borderRightColor = 'transparent'; // Make border transparent
                    // Remove the blink-caret animation specifically
                    let currentAnimation = window.getComputedStyle(typingText).animation;
                    // Filter out the blink-caret animation part
                    let newAnimation = currentAnimation.split(',')
                                             .filter(anim => !anim.trim().startsWith('blink-caret'))
                                             .join(',');
                    typingText.style.animation = newAnimation;
                }
            });
        }
    }
}

// --- Card Carousel Functionality ---
function initializeCardCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    if (!carouselContainer) return;
    const viewport = carouselContainer.querySelector('.card-carousel-viewport');
    const track = carouselContainer.querySelector('.carousel-track');
    const cards = track ? Array.from(track.children).filter(child => child.classList.contains('flip-card')) : [];
    const nextButton = carouselContainer.querySelector('.carousel-next');
    const prevButton = carouselContainer.querySelector('.carousel-prev');
    if (!viewport || !track || cards.length === 0 || !nextButton || !prevButton) { if(nextButton) nextButton.style.display = 'none'; if(prevButton) prevButton.style.display = 'none'; return; }
    const cardsPerPage = 3; // Number of cards ideally visible
    let currentPage = 0; const totalCards = cards.length; const totalPages = Math.ceil(totalCards / cardsPerPage);
    let cardWidth = 0, cardGap = 0;
    const cardWidthCSS = 250; // Get from CSS if possible, else hardcode
    // Get gap from CSS (more robust)
    function calculateDimensions() {
        if (cards.length > 0) {
            const trackStyle = window.getComputedStyle(track);
            cardGap = parseFloat(trackStyle.gap); // Use gap property
            if (isNaN(cardGap) || cardGap === 0) { cardGap = 24; } // Fallback if gap is not set or 0 (approx 1.5rem)

            cardWidth = cardWidthCSS; // Assuming fixed width from CSS
            // Fallback: Get from first card if needed, but fixed width is better
            // if (cardWidth <= 0) { cardWidth = cards[0].offsetWidth; }
            if (cardWidth <= 0) console.error("Card width is 0. Cannot update carousel.");
        }
    }
    function updateCarousel() {
        if (cardWidth <= 0) {
            calculateDimensions();
            if(cardWidth <= 0) return; // Still can't calculate
        }
        const viewportWidth = viewport.offsetWidth;
        // Calculate how many cards *actually* fit (useful for responsiveness)
        // const actualCardsPerPage = Math.max(1, Math.floor((viewportWidth + cardGap) / (cardWidth + cardGap)));

        const startIndex = currentPage * cardsPerPage;
        // Width of the current "page" group
        let cardsOnCurrentPage = Math.min(cardsPerPage, totalCards - startIndex);
        let currentPageGroupWidth = (cardWidth * cardsOnCurrentPage) + (cardGap * Math.max(0, cardsOnCurrentPage - 1));

        // Position of the start of the current page
        let pageStartPosition = (cardWidth * startIndex) + (cardGap * startIndex);

        // Calculate offset to center the group within the viewport
        let centeringOffset = Math.max(0, (viewportWidth - currentPageGroupWidth) / 2);

        // Calculate the final translateX value
        let moveDistance = pageStartPosition - centeringOffset;

        // Ensure we don't translate beyond the bounds of the track
        const totalTrackWidth = (cardWidth * totalCards) + (cardGap * Math.max(0, totalCards - 1));
        const maxTranslateX = Math.max(0, totalTrackWidth - viewportWidth);
        moveDistance = Math.max(0, Math.min(moveDistance, maxTranslateX));

        track.style.transform = `translateX(-${moveDistance}px)`;

        // Update button states
        prevButton.disabled = (currentPage === 0);
        nextButton.disabled = (currentPage >= totalPages - 1);
    }
    nextButton.addEventListener('click', () => { if (currentPage < totalPages - 1) { currentPage++; track.querySelectorAll('.flip-card-inner.is-flipped').forEach(inner => inner.classList.remove('is-flipped')); setTimeout(updateCarousel, 50); /* Delay update slightly */ } });
    prevButton.addEventListener('click', () => { if (currentPage > 0) { currentPage--; track.querySelectorAll('.flip-card-inner.is-flipped').forEach(inner => inner.classList.remove('is-flipped')); setTimeout(updateCarousel, 50); /* Delay update slightly */ } });
    cards.forEach((card) => { const cardInner = card.querySelector('.flip-card-inner'); if (cardInner) card.addEventListener('click', () => cardInner.classList.toggle('is-flipped')); });
    let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { calculateDimensions(); updateCarousel(); }, 250); });
    calculateDimensions(); updateCarousel();
}

// --- Challenge Modal Functionality ---
const challengeData = { /* Keep your challenge data object here */
    "leisure": { title: "Finding Work and Leisure Balance", image: "assets/worklife.jpg", challengeText: "As a student, sometimes we either: lose time for ourselves being immersed with work, or laying in bed all day, choosing to prioritize ourselves first. And most of the time, we can't have both at the same time.", learningText: "Because of this issue that I constantly face, I learnt the importance of visualizing schedules. Through this, I learnt how to mitigate or lessen the impact of trying to provide attention both for myself and my work. I also learned how to say 'No' for both occasions when I know that one aspect needs my time and attention more." },
    "tight-deadlines": { title: "Tight Project Deadlines", image: "assets/deadline.jpg", challengeText: "Balancing multiple freelance graphic design projects simultaneously often led to conflicting priorities and pressure to deliver quickly without sacrificing quality.", learningText: "Improved upfront communication with clients regarding realistic timelines and scope became essential." },
    "student": { title: "Student Learning Curve", image: "assets/student.jpg", challengeText: "Learning Programming and its concepts can be quite a deceptive ride, one moment the ride is going well and you understand it nicely, then the next you are bomobarded with things you'll come across upon developing.", learningText: "I accepted the struggle and deepened my understanding of the languages I study even further. Learned the importance of seeking help from peers and that there is nothing wrong with that." },
    "vague-feedback": { title: "Interpreting Vague Feedback", image: "assets/design.jpg", challengeText: "Having clients with vague or generalized suggestions is quite common in my experience as a graphic designer, which in turn makes it difficult to translate into actionable design changes.", learningText: "Developed strategies for eliciting more specific feedback, such as asking targeted questions ('What specific element feels weak?', 'What kind of 'pop' - brighter colors, more contrast?'), and presenting 2-3 distinct options early on to gauge preferences accurately." }
};
function initializeChallengeModals() {
    const challengeBoxes = document.querySelectorAll('.challenge-box[data-modal-target]');
    const modal = document.getElementById('challenge-detail-modal');
    if (challengeBoxes.length === 0 || !modal) return;
    const modalTitle = modal.querySelector('#challenge-modal-title');
    const modalImage = modal.querySelector('#challenge-modal-image');
    const modalBody = modal.querySelector('#challenge-modal-body');
    const modalCloseBtn = modal.querySelector('.modal-close-btn');
    if (!modalTitle || !modalImage || !modalBody || !modalCloseBtn) return;
    function openChallengeModal(targetId) { const data = challengeData[targetId]; if (!data) return; modalTitle.textContent = data.title; modalImage.src = data.image || 'assets/default-challenge.svg'; modalImage.alt = data.title + " illustration"; modalBody.innerHTML = `<h4>The Challenge:</h4><p>${data.challengeText}</p><h4>Key Learning:</h4><p>${data.learningText}</p>`; modal.classList.add('visible'); }
    function closeChallengeModal() { modal.classList.remove('visible'); }
    challengeBoxes.forEach(box => { box.addEventListener('click', (event) => { const target = event.currentTarget.dataset.modalTarget; if (target) openChallengeModal(target); }); });
    modalCloseBtn.addEventListener('click', closeChallengeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeChallengeModal(); });
}

// --- Family Tree Tooltip/Line Functionality (Old - REMOVED/COMMENTED for clarity) ---
// function initializeFamilyTreeTooltips() { ... }
// function drawFamilyTreeLines() { ... }


// === NEW: Family Member Data ===
const familyMemberData = {
    "grandpa-p": {
        image: "assets/tata.png",
        title: "Tata",
        description: "This is Tata, he and Mamalab took care of me in my younger years. He has cared for me and gave me many unforgettable memories. One fond memory I have of him is when he takes me to our small lot and let me loiter around while he harvests our guava and banana trees."
    },
    "grandma-p": {
        image: "assets/ellen.jpg",
        title: "Mamalab",
        description: "Mamalab is the reason for who and what I am today. She is the one who took care of me when I was a child, and she is the one who taught me how to read and write. Every moment with her is a memory I will cherish forever."
    },
    "grandpa-m": {
        image: "assets/tatay.png",
        title: "Tatay Pedro",
        description: "Tatay Pedro lives with Nanay in the province. I've known him as a rigid, yet caring person in our family. A fond memory I have with him is when he took me around the city in our province riding a motorcycle. It's probably the reason why I'm fond of motorcycles."
    },
    "grandma-m": {
        image: "assets/rachel.jpg",
        title: "Maternal Grandmother",
        description: "Nanay is my grandmother in our province, Ilo Ilo. We used to visit every summer and I remember her as a kind and nurturing person. She always made sure I was well-fed and cared for. I remember her cooking my favorite dishes and telling me stories about our family history."
    },
    "dad": {
        image: "assets/ramon.png",
        title: "Ramon Bermas (Dad)",
        description: "My father, sometimes I call abeoji, is a hardworking father. He is the one who keeps our family afloat. Though he works overseas, we make up for lost time by spending time together whenever he comes home. We spend the night having midnight snacks and watching movies. I remember one time when he came home, we spent the whole night playing games and eating snacks. It was a great bonding moment for us."
    },
    "mom": {
        image: "assets/mary.jpg",
        title: "Mary Chris Manzano (Mom)",
        description: "My mother, my bestie. We often share a lot of stuff when it comes to our K-Pop Idols and K-Dramas. Whenever I have a problem, I always go to her for advice. It was a great way to bond and I felt so much better afterwards."
    },
    "brother": {
        image: "assets/marc.jpg",
        title: "Marc Louise Bermas (Older Brother)",
        description: "My older brother, always the onlooker for us younger siblings, whenever there is a problem in the house, he's sure to fix it because of how handy he is."
    },
    "me": {
        image: "assets/zild.jpg",
        title: "Zildjian Bermas (Me)",
        description: "That's me! Trying to navigate life, studies, and creativity. I used to live in the side of my grandparents, and I have a lot of fond memories with them. But, I now live with my parents here in Cavite. I am a student, and I am currently studying at CVSU-B. I am a web developer and a graphic designer. I love to create things, and I love to learn new things."
    },
    "sister": {
        image: "assets/zian.jpg",
        title: "Zian Chris Bermas (Younger Sister)",
        description: "My younger sister, Zian. Bright, bubbly, and keeps the family lively. She loves to draw anything about fashion. From kimonos to gothic dresses, she loves to draw them all. She is also a student."
    }
    // Add more entries if you expand the tree
};

// === NEW: Family Tree Interaction Functionality ===
function initializeFamilyTreeInteractions() {
    // Selectors for the main elements
    const familyContainer = document.querySelector('.family-tree-container');
    const modal = document.getElementById('family-member-modal');

    // Early exit if container or modal aren't found on the page
    if (!familyContainer || !modal) {
         console.log("[DEBUG] Family tree container or modal not found. Skipping initialization.");
        return;
    }

    // Select all the clickable/hoverable nodes within the tree
    const nodes = familyContainer.querySelectorAll('.tree-node');
    // Select elements inside the modal
    const modalCloseBtn = modal.querySelector('.modal-close-btn');
    const modalImage = modal.querySelector('#family-modal-image');
    const modalTitle = modal.querySelector('#family-modal-title');
    const modalBody = modal.querySelector('#family-modal-body');

    // Check if modal inner elements exist
    if (!modalCloseBtn || !modalImage || !modalTitle || !modalBody) {
        console.error("Required elements within the family modal (#family-member-modal) are missing. Check IDs: #family-modal-image, #family-modal-title, #family-modal-body and class .modal-close-btn");
        return; // Stop if modal is incomplete
    }

    // --- Modal Logic ---
    function openFamilyModal(targetId) {
        const data = familyMemberData[targetId]; // Get data using the ID from data-modal-target
        if (!data) {
            // Handle case where data for the clicked node isn't defined
            console.warn(`No data found in familyMemberData for modal target: ${targetId}`);
            modalTitle.textContent = "Information Unavailable";
            modalImage.src = "assets/default-avatar.png"; // Provide a fallback image path
            modalImage.alt = "Default image";
            modalBody.innerHTML = "<p>Details for this family member are not currently available.</p>";
        } else {
            // Populate modal with data
            modalTitle.textContent = data.title || "Family Member"; // Use title or default
            modalImage.src = data.image || "assets/default-avatar.png"; // Use image or default
            modalImage.alt = (data.title || "Family member") + " photo";
            modalBody.innerHTML = `<p>${data.description || 'No description available.'}</p>`; // Use description or default
        }
        modal.classList.add('visible'); // Show the modal (uses style.css .visible class)
    }

    function closeFamilyModal() {
        modal.classList.remove('visible'); // Hide the modal
    }

    // Add click listener to each tree node to open the modal
    nodes.forEach(node => {
        node.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default '#' link behavior
            const target = node.dataset.modalTarget; // Get the ID from data-modal-target attribute
            if (target) {
                openFamilyModal(target); // Call function to open modal with this ID
            } else {
                console.warn("Clicked node is missing data-modal-target attribute", node);
            }
        });
    });

    // Add listener to the modal's close button
    modalCloseBtn.addEventListener('click', closeFamilyModal);

    // Add listener to the modal overlay (background) to close it when clicked
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { // Only close if the click is on the overlay itself
            closeFamilyModal();
        }
    });

    // --- Hover Highlighting Logic ---
    nodes.forEach(node => {
        // When mouse enters a node...
        node.addEventListener('mouseenter', () => {
            const hoveredNode = node;
            // Get the group name of the hovered node (e.g., "parents", "siblings", "gp-paternal")
            const nodeGroup = hoveredNode.dataset.group;
            // Get the group name of the PARENT group this node belongs to (e.g., "gp-paternal", "parents")
            const parentGroup = hoveredNode.dataset.childOf;

            // 1. Clear all previous highlights
            nodes.forEach(n => n.classList.remove('highlight-group'));

            // 2. Highlight the node being hovered over
            hoveredNode.classList.add('highlight-group');

            // 3. Highlight direct parents: Find nodes whose 'data-group' matches the hovered node's 'data-child-of'
            if (parentGroup) {
                const parents = familyContainer.querySelectorAll(`.tree-node[data-group='${parentGroup}']`);
                parents.forEach(parent => parent.classList.add('highlight-group'));
            }

            // 4. Highlight direct children: Find nodes whose 'data-child-of' matches the hovered node's 'data-group'
            if (nodeGroup) {
                const children = familyContainer.querySelectorAll(`.tree-node[data-child-of='${nodeGroup}']`);
                children.forEach(child => child.classList.add('highlight-group'));
            }
        });
    });

    // When mouse leaves the entire tree container...
    familyContainer.addEventListener('mouseleave', () => {
        // Clear all highlights
        nodes.forEach(n => n.classList.remove('highlight-group'));
    });

    console.log("[DEBUG] Family tree interactions initialized successfully."); // Success message
}


// --- Initialize functionality when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    // console.log("DOM Content Loaded. Running initial setups."); // Keep or remove

    // Common elements
    const hamburgerIcon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (hamburgerIcon) { hamburgerIcon.addEventListener('click', toggleMenu); }
    const hamburgerLinks = document.querySelectorAll('#hamburger-nav .menu-links a');
    hamburgerLinks.forEach(link => { if (typeof toggleMenu === 'function') { link.addEventListener('click', toggleMenu); } });

    // Page-specific initializations
    if (document.getElementById('web-dev-skills-box')) { setupSkillsPagination('web-dev-skills-box'); }
    if (document.getElementById('graphic-design-skills-box')) { setupSkillsPagination('graphic-design-skills-box'); }

    // Initialize multi-slide modals if triggers exist
    if (document.getElementById('education-box-trigger')) { initializeMultiSlideModal('education-box-trigger', 'education-modal'); }
    if (document.getElementById('experience-box-trigger')) { initializeMultiSlideModal('experience-box-trigger', 'experience-modal'); }

    // Real Me Page specific
    if (document.getElementById('initial-layer')) {
        initializeScreenOffTransition();
        if (document.querySelector('#real-me-peel .carousel-container')) {
            initializeCardCarousel();
        }
    }

    // Gallery Page specific (assuming gallery.js exists and exports initGallery)
    if (document.querySelector('.infinite-gallery-container')) {
        (async () => {
            try {
                const galleryModule = await import('./gallery.js'); // MAKE SURE gallery.js exists!
                if (galleryModule && typeof galleryModule.initGallery === 'function') {
                    galleryModule.initGallery();
                } else {
                    console.error("initGallery function not found in gallery.js module.");
                }
            } catch (e) {
                // Ignore error if gallery.js is intentionally missing for some pages
                if (e.message.includes('Failed to fetch dynamically imported module')) {
                     console.log("gallery.js not found on this page, skipping gallery init.");
                } else {
                    console.error("Failed to load or initialize gallery:", e);
                }
            }
        })();
    }

    // Challenges Page specific
    if (document.querySelector('.challenge-box')) { initializeChallengeModals(); }

    // --- Family Tree Initialization ---
    // Check if the main container for the family tree exists on the current page
    if (document.querySelector('.family-tree-container')) {
        initializeFamilyTreeInteractions(); // Run the function to set up hover and modal
        // console.log("[DEBUG] Called initializeFamilyTreeInteractions."); // Optional log
    }

    // Initialize carousel if on a page without the 'initial-layer' (e.g., not the real-me page)
    if (document.querySelector('.carousel-container') && !document.getElementById('initial-layer')) {
        initializeCardCarousel();
    }

}); // End DOMContentLoaded

// --- END OF FILE script.js ---