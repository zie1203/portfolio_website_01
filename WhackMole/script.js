document.addEventListener('DOMContentLoaded', () => {
    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const scoreBoard = document.getElementById('score');
    const timeLeftBoard = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-button');

    let score = 0;
    let timeLeft = 30; // Game duration in seconds
    let gameTimerId = null; // For the overall game countdown
    let moleTimerId = null; // For mole appearances
    let currentMoleHole = null; // Track which hole has the active mole
    let isGameRunning = false;
    let moleAppearanceTime; // How long the mole stays up

    const MIN_APPEARANCE_TIME = 500; // Minimum ms mole stays up
    const MAX_APPEARANCE_TIME = 1200; // Maximum ms mole stays up
    const MIN_INTERVAL = 300; // Minimum ms between moles
    const MAX_INTERVAL = 1000; // Maximum ms between moles

    function randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    function getRandomHole() {
        const idx = Math.floor(Math.random() * holes.length);
        const hole = holes[idx];

        // Prevent the same hole appearing twice in a row immediately
        if (hole === currentMoleHole) {
            // console.log('Ah, same hole, trying again');
            return getRandomHole();
        }
        currentMoleHole = hole;
        return hole;
    }

    function peep() {
        if (!isGameRunning) return; // Stop if game ended

        const time = randomTime(MIN_APPEARANCE_TIME, MAX_APPEARANCE_TIME);
        const hole = getRandomHole();

        hole.classList.add('up');

        // Store the timeout ID *on the hole itself* or in a map if needed
        // Here, we primarily rely on clearing the main moleTimerId before setting a new one
        hole.peepTimeoutId = setTimeout(() => {
            hideMole(hole); // Hide this specific mole
            // Schedule the next mole after a random interval
            moleTimerId = setTimeout(peep, randomTime(MIN_INTERVAL, MAX_INTERVAL));
        }, time);
    }

    function hideMole(hole) {
        if (hole && hole.classList.contains('up')) {
            hole.classList.remove('up');
            if (hole.peepTimeoutId) {
                clearTimeout(hole.peepTimeoutId); // Clear specific timeout if hiding early
                hole.peepTimeoutId = null;
            }
            if (currentMoleHole === hole) {
                currentMoleHole = null; // Clear tracked hole if it was the current one
            }
        }
    }

    function hideAllMoles() {
        holes.forEach(hole => {
            hideMole(hole);
        });
    }

    function startGame() {
        if (isGameRunning) return; // Prevent starting multiple times

        console.log('Starting game...');
        isGameRunning = true;
        score = 0;
        timeLeft = 30; // Reset timer
        scoreBoard.textContent = score;
        timeLeftBoard.textContent = timeLeft;
        gameOverScreen.classList.add('hidden'); // Hide game over screen
        startButton.disabled = true; // Disable start button during game
        hideAllMoles(); // Ensure board is clear

        // Start the countdown timer
        gameTimerId = setInterval(() => {
            timeLeft--;
            timeLeftBoard.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);

        // Start the mole popping sequence
        clearTimeout(moleTimerId); // Clear any previous mole timer
        moleTimerId = setTimeout(peep, randomTime(MIN_INTERVAL, MAX_INTERVAL)); // Start first peep
    }

    function endGame() {
        console.log('Game Over!');
        isGameRunning = false;
        clearInterval(gameTimerId); // Stop countdown
        clearTimeout(moleTimerId);  // Stop moles from appearing

        // Clear any specific mole timeouts that might still be running
        holes.forEach(hole => {
            if(hole.peepTimeoutId) clearTimeout(hole.peepTimeoutId);
        });

        hideAllMoles(); // Hide any visible moles

        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
        startButton.disabled = false; // Re-enable start button
        currentMoleHole = null; // Reset tracked hole
    }

    function whack(event) {
        if (!isGameRunning) return; // Can't score if game isn't running

        // Check if the clicked element is a mole AND its parent hole is 'up'
        if (event.target.classList.contains('mole') && event.target.closest('.hole').classList.contains('up')) {
            score++;
            scoreBoard.textContent = score;
            const hole = event.target.closest('.hole');
            hideMole(hole); // Immediately hide the whacked mole

            // Optional: Add visual feedback
            // event.target.style.backgroundColor = 'red'; // Example temporary feedback
            // setTimeout(() => { event.target.style.backgroundColor = ''; }, 100);

            // VERY IMPORTANT: Stop the current mole loop and start the next one immediately
            // This prevents scoring multiple times on one mole and keeps the pace up.
            clearTimeout(moleTimerId); // Stop the *scheduled* next peep
            clearTimeout(hole.peepTimeoutId); // Stop the timeout for *this specific mole* to hide itself
            hole.peepTimeoutId = null;

            moleTimerId = setTimeout(peep, randomTime(MIN_INTERVAL, MAX_INTERVAL)); // Schedule next peep sooner
        }
    }

    // Add event listeners to moles (using event delegation on the board is often better, but this is simpler for now)
    moles.forEach(mole => mole.addEventListener('click', whack));

    // Start/Restart buttons
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame); // Play again uses the same start function
});