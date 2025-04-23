document.addEventListener('DOMContentLoaded', () => {
    const difficultySelect = document.getElementById('difficulty');
    const startButton = document.getElementById('start-button');
    const gameBoard = document.getElementById('game-board');
    const timerElement = document.getElementById('timer');
    const movesElement = document.getElementById('moves');
    const resultsElement = document.getElementById('results');
    const resultDifficulty = document.getElementById('result-difficulty');
    const resultTime = document.getElementById('result-time');
    const resultMoves = document.getElementById('result-moves');
    const resultScore = document.getElementById('result-score');
    const playAgainButton = document.getElementById('play-again-button');

    // --- Emojis for cards ---
    // Ensure you have enough unique emojis for the hardest difficulty (12 pairs)
    const symbols = ['🍎', '🍌', '🍒', '🍓', '🍇', '🍊', '🍋', '🍍', '🍉', '🥝', '🥭', '🥥', '🍑', '🍐', '🍅', '🍆'];

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let timerInterval = null;
    let seconds = 0;
    let canFlip = true; // Prevent flipping more than 2 cards at once

    const difficultySettings = {
        easy: { pairs: 4, class: 'easy' },
        medium: { pairs: 8, class: 'medium' },
        hard: { pairs: 12, class: 'hard' }
    };

    // --- Game Functions ---

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    function createBoard() {
        // Reset previous game state
        gameBoard.innerHTML = '';
        resultsElement.classList.add('hidden');
        gameBoard.classList.remove('easy', 'medium', 'hard'); // Remove old classes
        moves = 0;
        matchedPairs = 0;
        seconds = 0;
        flippedCards = [];
        canFlip = true;
        updateMoves();
        updateTimerDisplay();
        stopTimer(); // Ensure any previous timer is stopped

        // Get difficulty and set up
        const difficulty = difficultySelect.value;
        const settings = difficultySettings[difficulty];
        totalPairs = settings.pairs;
        gameBoard.classList.add(settings.class); // Add class for CSS grid styling

        // Prepare card symbols
        const selectedSymbols = symbols.slice(0, totalPairs);
        const cardValues = shuffle([...selectedSymbols, ...selectedSymbols]); // Duplicate and shuffle

        // Create card elements
        cardValues.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value; // Store the symbol in a data attribute

            // Create front and back faces
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            // cardBack.textContent = '?'; // Optional: show something on the back

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            cardFront.textContent = value; // The actual symbol/emoji

            card.appendChild(cardBack);
            card.appendChild(cardFront);

            card.addEventListener('click', handleCardClick);
            gameBoard.appendChild(card);
        });

        cards = document.querySelectorAll('.card'); // Update the cards NodeList
    }

    function handleCardClick(event) {
        if (!canFlip) return; // Exit if flipping is disabled

        const clickedCard = event.currentTarget;

        // Prevent clicking the same card twice or an already matched card
        if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
            return;
        }

        // Start timer on first click
        if (timerInterval === null && seconds === 0) {
            startTimer();
        }

        flipCard(clickedCard);
        flippedCards.push(clickedCard);

        if (flippedCards.length === 2) {
            canFlip = false; // Disable flipping while checking
            incrementMoves();
            checkForMatch();
        }
    }

    function flipCard(card) {
        card.classList.add('flipped');
    }

    function unflipCard(card) {
        card.classList.remove('flipped');
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const value1 = card1.dataset.value;
        const value2 = card2.dataset.value;

        if (value1 === value2) {
            // It's a match!
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.removeEventListener('click', handleCardClick); // Optional: disable click on matched
            card2.removeEventListener('click', handleCardClick); // Optional: disable click on matched
            matchedPairs++;
            flippedCards = []; // Clear flipped cards array
            canFlip = true; // Allow flipping again

            if (matchedPairs === totalPairs) {
                endGame();
            }
        } else {
            // Not a match
            setTimeout(() => {
                unflipCard(card1);
                unflipCard(card2);
                flippedCards = []; // Clear flipped cards array
                canFlip = true; // Allow flipping again
            }, 1000); // Wait 1 second before flipping back
        }
    }

    function startTimer() {
        stopTimer(); // Clear any existing timer
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null; // Reset interval ID
    }

    function updateTimerDisplay() {
        timerElement.textContent = seconds;
    }

    function incrementMoves() {
        moves++;
        updateMoves();
    }

    function updateMoves() {
        movesElement.textContent = moves;
    }

    function calculateScore() {
        // Simple scoring: higher score for faster completion and fewer moves.
        // Adjust the multipliers as needed for desired difficulty/reward.
        const baseScore = totalPairs * 100; // Points per pair
        const timePenalty = seconds * 2; // Penalty per second
        const movePenalty = moves * 1;    // Penalty per move

        let score = baseScore - timePenalty - movePenalty;
        return Math.max(0, score); // Score cannot be negative
    }

    function endGame() {
        stopTimer();
        const finalScore = calculateScore();

        // Display results
        resultDifficulty.textContent = difficultySelect.options[difficultySelect.selectedIndex].text;
        resultTime.textContent = seconds;
        resultMoves.textContent = moves;
        resultScore.textContent = finalScore;
        resultsElement.classList.remove('hidden');

        // Optionally disable the board completely
        canFlip = false;
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', createBoard);
    playAgainButton.addEventListener('click', () => {
        resultsElement.classList.add('hidden'); // Hide results
        createBoard(); // Start a new game with current settings
    });

    // Optional: Automatically start a new game when difficulty changes,
    // or just let the user click "Start Game" again.
    // difficultySelect.addEventListener('change', createBoard);

    // Initial setup message or auto-start
    // createBoard(); // Uncomment if you want the game to load immediately on medium difficulty
});