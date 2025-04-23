

// --- Configuration ---
const DAMPING = 0.08; // Easing factor for smoother dragging (smaller = smoother)
const ITEM_WIDTH = 250; // px - Must match CSS
const ITEM_HEIGHT = 350; // px - Must match CSS
const GAP = 24; // px - Approx gap (adjust based on CSS rem value or measure)
const SCROLL_MULTIPLIER = 1.5; // How much dragging moves the canvas
const IMAGE_FOLDER = "assets"; // Path to your gallery images folder
const ITEMS = [ // Array of image filenames and titles
    { file: "dont troll.svg", title: "Don't Troll Poster" },
    { file: "kabsu.png", title: "Kabsuhenyo Poster" }, // Ensure filename is correct
    { file: "invi1.png", title: "Invitation Design" }, // Ensure filename is correct
    { file: "abduction.png", title: "Abduction Poster" },
    { file: "acs.svg", title: "A.Coffee Stop Logo" },
    { file: "letgo.png", title: "Let Go Poster" },
    { file: "ticket.png", title: "Ticket Poster" }
    // Add all your images here
];
const ITEM_COUNT = ITEMS.length;

// --- Global State Variables ---
let container, canvas, overlay, titleOverlay; // DOM elements
let cols = 0, rows = 0; // Grid dimensions
let isDragging = false;
let startX = 0, startY = 0;
let currentX = 0, currentY = 0; // Smoothed position
let targetX = 0, targetY = 0;   // Target drag position
let itemsMap = new Map();       // Store created items by ID (row_col)
let isExpanded = false;
let activeItemId = null;
let originalItemPosition = null; // Store rect of item before expansion
let canClick = true; // Prevent click during drag
let lastUpdateTime = 0; // For optimizing updates

const BUFFER = 3;

// --- Helper Functions ---
const lerp = (a, b, n) => (1 - n) * a + n * b; // Linear interpolation
const modulo = (a, n) => ((a % n) + n) % n; // Correct modulo for negative numbers

// --- Core Logic ---

function calculateGridDimensions() {
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    cols = Math.ceil(containerWidth / (ITEM_WIDTH + GAP)) + 4; // Add buffer columns
    rows = Math.ceil(containerHeight / (ITEM_HEIGHT + GAP)) + 4; // Add buffer rows
    console.log(`[DEBUG] Grid Dimensions: ${cols}x${rows}`);
}

function createGalleryItem(row, col) {
    const itemIndex = modulo(row * cols + col, ITEM_COUNT); // Wrap index
    const itemId = `${row}_${col}`;
    const itemData = ITEMS[itemIndex];

    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.id = `item_${itemId}`; // Unique ID for targeting
    item.dataset.id = itemId; // Store grid coords
    item.dataset.title = itemData.title;
    item.dataset.src = `${IMAGE_FOLDER}/${itemData.file}`;

    const img = document.createElement('img');
    img.src = item.dataset.src;
    img.alt = itemData.title;
    // img.loading = 'lazy'; // Consider lazy loading

    item.appendChild(img);
    canvas.appendChild(item);
    itemsMap.set(itemId, item); // Store reference

    // Add click listener for expansion
    item.addEventListener('click', handleItemClick);

    return item;
}

function updateItemPosition(item, row, col) {
    const gridWidth = cols * (ITEM_WIDTH + GAP);
    const gridHeight = rows * (ITEM_HEIGHT + GAP);

    const idealX = col * (ITEM_WIDTH + GAP);
    const idealY = row * (ITEM_HEIGHT + GAP);

    // Calculate wrapped position based on current canvas translation
    const displayX = modulo(idealX - currentX, gridWidth) - (ITEM_WIDTH + GAP) * 2; // Adjust based on buffer
    const displayY = modulo(idealY - currentY, gridHeight) - (ITEM_HEIGHT + GAP) * 2; // Adjust based on buffer

    gsap.set(item, { x: displayX, y: displayY }); // Use GSAP for setting position
}

function updateVisibleItems() {
    const now = performance.now();
    // Throttle updates slightly to avoid excessive calculations
    if (now - lastUpdateTime < 16) { // Roughly 60fps
        return;
    }
    lastUpdateTime = now;

    if (!container || cols === 0 || rows === 0) return; // Ensure grid is calculated

    const currentScrollCol = Math.floor(currentX / (ITEM_WIDTH + GAP));
    const currentScrollRow = Math.floor(currentY / (ITEM_HEIGHT + GAP));

    const buffer = 2; // How many extra rows/cols to render around viewport
    const startCol = currentScrollCol - buffer;
    const endCol = currentScrollCol + cols - 1 + buffer;
    const startRow = currentScrollRow - buffer;
    const endRow = currentScrollRow + rows - 1 + buffer;

    const currentVisibleIds = new Set();

    // Update or create visible items
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            const itemId = `${r}_${c}`;
            currentVisibleIds.add(itemId);

            let item = itemsMap.get(itemId);
            if (!item) {
                item = createGalleryItem(r, c);
            }
            updateItemPosition(item, r, c);
        }
    }

    // Remove items no longer visible
    itemsMap.forEach((item, id) => {
        if (!currentVisibleIds.has(id) && id !== activeItemId) { // Don't remove active item
            item.removeEventListener('click', handleItemClick); // Clean up listener
            item.remove();
            itemsMap.delete(id);
        }
    });
}

function handleItemClick(event) {
    if (!canClick || isExpanded) return; // Don't trigger if dragging or already expanded

    const item = event.currentTarget;
    if (!item || item.id === activeItemId) return; // Ignore if clicking the already expanded item (shouldn't happen)

    isExpanded = true;
    activeItemId = item.id;
    canClick = false; // Disable clicks during animation
    container.style.cursor = 'default'; // Reset cursor

    const itemRect = item.getBoundingClientRect(); // Get position relative to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate target scale and position
    const scaleX = viewportWidth * 0.8 / itemRect.width; // Scale to 80% width
    const scaleY = viewportHeight * 0.8 / itemRect.height;
    const targetScale = Math.min(scaleX, scaleY); // Scale uniformly

    const targetX = (viewportWidth / 2) - (itemRect.left + itemRect.width / 2);
    const targetY = (viewportHeight / 2) - (itemRect.top + itemRect.height / 2);

    originalItemPosition = { // Store original state
        x: gsap.getProperty(item, "x"),
        y: gsap.getProperty(item, "y"),
        width: itemRect.width,
        height: itemRect.height
    };

    // Animate title and overlay
    titleOverlay.textContent = item.dataset.title;
    overlay.classList.add('visible');
    titleOverlay.classList.add('visible'); // Trigger CSS transition

    // Animate item using GSAP
    gsap.to(item, {
        x: targetX + gsap.getProperty(item, "x"), // Add current transform to relative viewport calc
        y: targetY + gsap.getProperty(item, "y"),
        scale: targetScale,
        duration: 0.7,
        ease: "power3.inOut",
        zIndex: 2001, // Bring item above overlay slightly
        onComplete: () => {
            canClick = true; // Re-enable clicks after animation
            // Add listener to overlay to close
            overlay.addEventListener('click', collapseItem);
        }
    });
}

function collapseItem() {
    if (!isExpanded || !activeItemId) return;

    const item = document.getElementById(activeItemId); // Get the expanded item
    if (!item || !originalItemPosition) return;

    canClick = false; // Disable clicks during animation
    overlay.removeEventListener('click', collapseItem); // Clean up listener

    // Animate overlay and title out
    overlay.classList.remove('visible');
    titleOverlay.classList.remove('visible');

    // Animate item back to original position using GSAP
    gsap.to(item, {
        x: originalItemPosition.x,
        y: originalItemPosition.y,
        scale: 1,
        duration: 0.7,
        ease: "power3.inOut",
        zIndex: 1, // Reset z-index
        onComplete: () => {
            isExpanded = false;
            activeItemId = null;
            originalItemPosition = null;
            canClick = true;
            container.style.cursor = 'grab'; // Restore grab cursor
            updateVisibleItems(); // Refresh grid to ensure item is placed correctly
        }
    });
}


// --- Drag Event Handlers ---
function onPointerDown(e) {
    if (isExpanded) return; // Don't drag if item is expanded
    isDragging = true;
    canClick = true; // Assume click initially
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
    container.style.cursor = 'grabbing';
    // Clear potential momentum from previous drag
    gsap.killTweensOf(targetX);
    gsap.killTweensOf(targetY);
}

function onPointerMove(e) {
    if (!isDragging || isExpanded) return;
    canClick = false; // It's a drag, not a click

    const currentMouseX = e.clientX || e.touches[0].clientX;
    const currentMouseY = e.clientY || e.touches[0].clientY;

    const deltaX = (currentMouseX - startX) * SCROLL_MULTIPLIER;
    const deltaY = (currentMouseY - startY) * SCROLL_MULTIPLIER;

    // Update target position immediately
    targetX -= deltaX;
    targetY -= deltaY;

    // Update start positions for next move calculation
    startX = currentMouseX;
    startY = currentMouseY;

    // No need to call updateVisibleItems here, the loop handles it
}

function onPointerUp() {
    if (isExpanded) return;
    isDragging = false;
    container.style.cursor = 'grab';
    // Add momentum/inertia here if desired using dragVelocity and GSAP tween
}

// --- Animation Loop ---
function animationLoop() {
    if (!isExpanded) { // Only update grid if not expanded
        // Apply damping (lerp)
        currentX = lerp(currentX, targetX, DAMPING);
        currentY = lerp(currentY, targetY, DAMPING);

        // Update canvas transform
        gsap.set(canvas, { x: -currentX, y: -currentY });

        // Update items visibility and position
        updateVisibleItems();
    }

    requestAnimationFrame(animationLoop);
}

// --- Initialization ---
function initGallery() {
    container = document.querySelector('.infinite-gallery-container');
    canvas = container?.querySelector('.gallery-canvas');
    overlay = document.querySelector('.gallery-overlay');
    titleOverlay = overlay?.querySelector('.project-title-overlay');

    if (!container || !canvas || !overlay || !titleOverlay) {
        console.error("Gallery elements not found. Aborting initialization.");
        return;
    }

    calculateGridDimensions();
    updateVisibleItems(); // Initial population

    // Add Event Listeners
    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: true });

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    window.addEventListener('resize', () => {
        // Debounce resize handling
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            console.log("Resizing...");
            calculateGridDimensions();
            // Reset positions slightly on resize?
            // targetX = currentX;
            // targetY = currentY;
            updateVisibleItems(); // Update immediately on resize end
            if(isExpanded) collapseItem(); // Collapse item on resize for simplicity
        }, 250);
    });

    // Start the animation loop
    requestAnimationFrame(animationLoop);
}

// Add this initialization to the main DOMContentLoaded listener in script.js
// (or call initGallery directly if this *is* script.js and only used on this page)

// --- Make sure this runs after the DOM is ready ---
// This part should be integrated into the DOMContentLoaded listener in script.js
// (If this code IS gallery.js and imported as type="module", it runs after DOM parse,
// but DOMContentLoaded ensures everything including other scripts might be ready)
// document.addEventListener('DOMContentLoaded', initGallery);

export { initGallery }; // Export if called from script.js