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
    const bodyElement = document.querySelector('body.realme-page-body');
    if (initialLayer && revealedContent && bodyElement) {
        const handleScreenOffClick = () => {
            if (initialLayer.classList.contains('turning-off')) return;
            initialLayer.classList.add('turning-off');
            bodyElement.classList.add('night-mode');
            document.body.classList.add('night-mode'); // Add global night mode too
            revealedContent.classList.add('visible');
        };
        initialLayer.addEventListener('click', handleScreenOffClick);
        const typingText = initialLayer.querySelector('.typing-text');
        if (typingText) {
            typingText.addEventListener('animationend', (event) => {
                if (event.animationName === 'typing') {
                    typingText.style.borderRightColor = 'transparent';
                    let currentAnimation = window.getComputedStyle(typingText).animation;
                    let newAnimation = currentAnimation.split(',').filter(anim => !anim.trim().startsWith('blink-caret')).join(',');
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
    const cardsPerPage = 3; let currentPage = 0; const totalCards = cards.length; const totalPages = Math.ceil(totalCards / cardsPerPage);
    let cardWidth = 0, cardGap = 0; const cardWidthCSS = 250; const cardGapCSSValue = "1.5rem";
    function calculateDimensions() { if (cards.length > 0) { const trackStyle = window.getComputedStyle(track); cardGap = parseFloat(trackStyle.gap); if (isNaN(cardGap) || cardGap === 0) { cardGap = 24; } cardWidth = cardWidthCSS; if (cardWidth <= 0) console.error("Card width is 0."); } }
    function updateCarousel() { if (cardWidth <= 0) { calculateDimensions(); if(cardWidth <= 0) return; } const viewportWidth = viewport.offsetWidth; const startIndex = currentPage * cardsPerPage; let cardsOnCurrentPage = Math.min(cardsPerPage, totalCards - startIndex); let currentPageGroupWidth = (cardWidth * cardsOnCurrentPage) + (cardGap * Math.max(0, cardsOnCurrentPage - 1)); let pageStartPosition = (cardWidth * startIndex) + (cardGap * startIndex); let centeringOffset = Math.max(0, (viewportWidth - currentPageGroupWidth) / 2); let moveDistance = pageStartPosition - centeringOffset; const totalTrackWidth = (cardWidth * totalCards) + (cardGap * Math.max(0, totalCards - 1)); const maxTranslateX = Math.max(0, totalTrackWidth - viewportWidth); moveDistance = Math.max(0, Math.min(moveDistance, maxTranslateX)); track.style.transform = `translateX(-${moveDistance}px)`; prevButton.disabled = (currentPage === 0); nextButton.disabled = (currentPage >= totalPages - 1); }
    nextButton.addEventListener('click', () => { if (currentPage < totalPages - 1) { currentPage++; track.querySelectorAll('.flip-card-inner.is-flipped').forEach(inner => inner.classList.remove('is-flipped')); setTimeout(updateCarousel, 50); } });
    prevButton.addEventListener('click', () => { if (currentPage > 0) { currentPage--; track.querySelectorAll('.flip-card-inner.is-flipped').forEach(inner => inner.classList.remove('is-flipped')); setTimeout(updateCarousel, 50); } });
    cards.forEach((card) => { const cardInner = card.querySelector('.flip-card-inner'); if (cardInner) card.addEventListener('click', () => cardInner.classList.toggle('is-flipped')); });
    let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { calculateDimensions(); updateCarousel(); }, 250); });
    calculateDimensions(); updateCarousel();
}

// --- Challenge Modal Functionality ---
const challengeData = { /* Keep your challenge data object here */
    "leisure": { title: "Finding Work and Leisure Balance", image: "/assets/worklife.jpg", challengeText: "As a student, sometimes we either: lose time for ourselves being immersed with work, or laying in bed all day, choosing to prioritize ourselves first. And most of the time, we can't have both at the same time.", learningText: "Because of this issue that I constantly face, I learnt the importance of visualizing schedules. Through this, I learnt how to mitigate or lessen the impact of trying to provide attention both for myself and my work. I also learned how to say 'No' for both occasions when I know that one aspect needs my time and attention more." },
    "tight-deadlines": { title: "Tight Project Deadlines", image: "/assets/deadline.jpg", challengeText: "Balancing multiple freelance graphic design projects simultaneously often led to conflicting priorities and pressure to deliver quickly without sacrificing quality.", learningText: "Improved upfront communication with clients regarding realistic timelines and scope became essential." },
    "student": { title: "Student Learning Curve", image: "/assets/student.jpg", challengeText: "Learning Programming and its concepts can be quite a deceptive ride, one moment the ride is going well and you understand it nicely, then the next you are bomobarded with things you'll come across upon developing.", learningText: "I accepted the struggle and deepened my understanding of the languages I study even further. Learned the importance of seeking help from peers and that there is nothing wrong with that." },
    "vague-feedback": { title: "Interpreting Vague Feedback", image: "/assets/design.jpg", challengeText: "Having clients with vague or generalized suggestions is quite common in my experience as a graphic designer, which in turn makes it difficult to translate into actionable design changes.", learningText: "Developed strategies for eliciting more specific feedback, such as asking targeted questions ('What specific element feels weak?', 'What kind of 'pop' - brighter colors, more contrast?'), and presenting 2-3 distinct options early on to gauge preferences accurately." }
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
    function openChallengeModal(targetId) { const data = challengeData[targetId]; if (!data) return; modalTitle.textContent = data.title; modalImage.src = data.image || '/assets/default-challenge.svg'; modalImage.alt = data.title + " illustration"; modalBody.innerHTML = `<h4>The Challenge:</h4><p>${data.challengeText}</p><h4>Key Learning:</h4><p>${data.learningText}</p>`; modal.classList.add('visible'); }
    function closeChallengeModal() { modal.classList.remove('visible'); }
    challengeBoxes.forEach(box => { box.addEventListener('click', (event) => { const target = event.currentTarget.dataset.modalTarget; if (target) openChallengeModal(target); }); });
    modalCloseBtn.addEventListener('click', closeChallengeModal);
    modal.addEventListener('click', (event) => { if (event.target === modal) closeChallengeModal(); });
}

// --- Family Tree Tooltip/Line Functionality ---
function initializeFamilyTreeTooltips() {
    const container = document.querySelector('.family-tree-container');
    const tooltip = document.getElementById('family-tooltip');
    const nodes = document.querySelectorAll('.family-node');
    const svgLines = container?.querySelector('.family-lines-svg');
    if (!container || !tooltip || nodes.length === 0 || !svgLines) return;

    setTimeout(drawFamilyTreeLines, 50); // Draw lines after initial render

    nodes.forEach(node => {
        const nodeId = node.id;
        node.addEventListener('mouseenter', () => {
            const name = node.dataset.name || 'Unknown'; const info = node.dataset.info || '';
            tooltip.querySelector('.tooltip-name').textContent = name; tooltip.querySelector('.tooltip-info').textContent = info;
            const tooltipWidth = tooltip.offsetWidth; const tooltipHeight = tooltip.offsetHeight;
            let topPos = node.offsetTop - tooltipHeight - 10; let leftPos = node.offsetLeft + (node.offsetWidth / 2) - (tooltipWidth / 2);
            topPos = Math.max(5, topPos); leftPos = Math.max(5, leftPos); if (leftPos + tooltipWidth > container.offsetWidth - 5) { leftPos = container.offsetWidth - tooltipWidth - 5; }
            tooltip.style.top = `${topPos}px`; tooltip.style.left = `${leftPos}px`; tooltip.classList.add('visible');
            svgLines.querySelectorAll('line').forEach(line => { line.classList.toggle('highlight-line', line.dataset.from === nodeId || line.dataset.to === nodeId || line.dataset.from?.includes(nodeId) || line.dataset.to?.includes(nodeId)); });
        });
        node.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            svgLines.querySelectorAll('line.highlight-line').forEach(line => line.classList.remove('highlight-line'));
        });
    });

    let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawFamilyTreeLines, 250); });
}
function drawFamilyTreeLines() {
    const container = document.querySelector('.family-tree-container'); const svg = container?.querySelector('.family-lines-svg'); if (!container || !svg) return; svg.innerHTML = '';
    const nodeElements = {}; container.querySelectorAll('.family-node').forEach(node => { nodeElements[node.id] = { el: node, x: node.offsetLeft + node.offsetWidth / 2, y: node.offsetTop + node.offsetHeight / 2, topY: node.offsetTop, bottomY: node.offsetTop + node.offsetHeight }; });
    const createLine = (x1, y1, x2, y2, fromId = '', toId = '', typeClass = '') => { const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2); if (fromId) line.setAttribute('data-from', fromId); if (toId) line.setAttribute('data-to', toId); if (typeClass) line.classList.add(typeClass); svg.appendChild(line); };
    const gpConnections = [ { pair: ['node-gma-m', 'node-gpa-m'], child: 'node-mother' }, { pair: ['node-gma-p', 'node-gpa-p'], child: 'node-father' } ];
    gpConnections.forEach(conn => { const gp1 = nodeElements[conn.pair[0]]; const gp2 = nodeElements[conn.pair[1]]; const child = nodeElements[conn.child]; if (gp1 && gp2 && child) { createLine(gp1.x, gp1.y, gp2.x, gp2.y, gp1.el.id, gp2.el.id, 'marriage-line'); const midX = gp1.x + (gp2.x - gp1.x) / 2; const junctionY = gp1.y; const parentTopY = child.y - child.el.offsetHeight / 2; createLine(midX, junctionY, midX, parentTopY - 10, gp1.el.id + "_" + gp2.el.id, child.el.id, 'parent-connector'); createLine(child.x, child.y, child.x, parentTopY - 10, child.el.id, gp1.el.id + "_" + gp2.el.id, 'parent-connector'); } else if (gp1 && child) createLine(gp1.x, gp1.bottomY, child.x, child.topY, gp1.el.id, child.el.id, 'parent-line'); else if (gp2 && child) createLine(gp2.x, gp2.bottomY, child.x, child.topY, gp2.el.id, child.el.id, 'parent-line'); });
    const mom = nodeElements['node-mother']; const dad = nodeElements['node-father']; const childrenIds = ['node-brother', 'node-me', 'node-sister']; const childrenNodes = childrenIds.map(id => nodeElements[id]).filter(Boolean);
    if (mom && dad && childrenNodes.length > 0) { createLine(mom.x, mom.y, dad.x, dad.y, mom.el.id, dad.el.id, 'marriage-line'); const parentMidX = mom.x + (dad.x - mom.x) / 2; const parentMidY = mom.y; const childJunctionY = childrenNodes[0].y - childrenNodes[0].el.offsetHeight / 2 - 30; createLine(parentMidX, parentMidY, parentMidX, childJunctionY, mom.el.id + '_' + dad.el.id, 'children', 'child-connector'); let minChildX = childrenNodes[0].x; let maxChildX = childrenNodes[0].x; childrenNodes.forEach(child => { minChildX = Math.min(minChildX, child.x); maxChildX = Math.max(maxChildX, child.x); }); if (childrenNodes.length > 1) { createLine(minChildX, childJunctionY, maxChildX, childJunctionY, 'children-bracket', 'children-bracket', 'child-line'); } childrenNodes.forEach(childNode => { createLine(childNode.x, childJunctionY, childNode.x, childNode.topY, 'children-bracket', childNode.el.id, 'child-line'); }); }
}


// --- Initialize functionality when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    // console.log("DOM Content Loaded. Running initial setups.");

    // Common elements
    const hamburgerIcon = document.querySelector("#hamburger-nav .hamburger-icon");
    if (hamburgerIcon) { hamburgerIcon.addEventListener('click', toggleMenu); }
    const hamburgerLinks = document.querySelectorAll('#hamburger-nav .menu-links a');
    hamburgerLinks.forEach(link => { if (typeof toggleMenu === 'function') { link.addEventListener('click', toggleMenu); } });

    // Page-specific initializations
    if (document.getElementById('web-dev-skills-box')) { setupSkillsPagination('web-dev-skills-box'); }
    if (document.getElementById('graphic-design-skills-box')) { setupSkillsPagination('graphic-design-skills-box'); }
    // Use the generic modal initializer for both Education and Experience
    initializeMultiSlideModal('education-box-trigger', 'education-modal');
    initializeMultiSlideModal('experience-box-trigger', 'experience-modal'); // Initialize Experience modal
    if (document.getElementById('initial-layer')) { initializeScreenOffTransition(); if (document.querySelector('#real-me-peel .carousel-container')) { initializeCardCarousel(); } }
    if (document.querySelector('.infinite-gallery-container')) { (async () => { try { const m = await import('./gallery.js'); if (m.initGallery) m.initGallery(); else console.error("initGallery missing"); } catch (e) { console.error("Gallery fail:", e); } })(); }
    if (document.querySelector('.challenge-box')) { initializeChallengeModals(); }
    if (document.querySelector('.family-tree-container')) { initializeFamilyTreeTooltips(); }
    if (document.querySelector('.carousel-container') && !document.getElementById('initial-layer')) { initializeCardCarousel(); }

}); // End DOMContentLoaded

// --- END OF FILE script.js ---