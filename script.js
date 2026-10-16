




const WORD_CATEGORIES = {
    Animals: [
        "LION", "TIGER", "ELEPHANT", "GIRAFFE", "MONKEY", "PENGUIN", 
        "DOLPHIN", "KANGAROO", "CHEETAH", "ZEBRA", "PANDA", "KOALA", 
        "FLAMINGO", "OCTOPUS", "CROCODILE", "GORILLA", "JAGUAR", "LEOPARD"
    ],
    Food: [
        "PIZZA", "BURGER", "SUSHI", "PASTA", "TACO", "PANCAKE", 
        "WAFFLE", "BURRITO", "SANDWICH", "CHOCOLATE", "NOODLES", 
        "DUMPLING", "SALAD", "LASAGNA", "POPCORN", "BROWNIE", "AVOCADO"
    ],
    Sports: [
        "SOCCER", "BASKETBALL", "TENNIS", "BASEBALL", "VOLLEYBALL", 
        "CRICKET", "BADMINTON", "SWIMMING", "BOXING", "RUGBY", 
        "HOCKEY", "ARCHERY", "SKATING", "BOWLING", "SURFING"
    ],
    Technology: [
        "SMARTPHONE", "COMPUTER", "INTERNET", "ROBOT", "BLUETOOTH", 
        "SATELLITE", "KEYBOARD", "MONITOR", "CAMERA", "HARDWARE", 
        "SOFTWARE", "NETWORK", "BATTERY", "CIRCUIT", "DATABASE"
    ],
    Programming: [
        "JAVASCRIPT", "PYTHON", "FUNCTION", "VARIABLE", "LOOP", 
        "ARRAY", "OBJECT", "BOOLEAN", "STRING", "COMPILER", 
        "DEBUGGER", "PROMISE", "FRAMEWORK", "SYNTAX", "ALGORITHM"
    ]
};


const BOSS_WORDS = [
    "ASYNCHRONOUS", "POLYMORPHISM", "ENCAPSULATION", "CRYPTOGRAPHY",
    "SUPERCOMPUTER", "MICROPROCESSOR", "CYBERSECURITY", "RATATOUILLE",
    "HIPPOPOTAMUS", "SNOWBOARDING", "WEIGHTLIFTING", "SERIALIZATION",
    "MULTITHREADING", "ARCHITECTURE", "QUANTUMCOMPUTING"
];


const MEME_VIDEOS = [
    "./meme1.mp4",
    "./meme2.mp4",
    "./meme3.mp4"
];
const BOSS_VIDEO = "./boss.mp4";
const RAGE_VIDEO = "./rage.mp4";
const REWARD_VIDEO = "./reward.mp4";




const MAX_LIVES = 6;
let currentWord = "";
let currentCategory = "Animals";
let selectedCategoryOption = "Random"; 
let guessedLetters = new Set();
let wrongLetters = [];
let lives = MAX_LIVES;
let score = 0;
let highScore = 0;
let round = 1;
let combo = 0;
let powerUpsRemaining = 3;
let isGameOver = false;
let isRoundWon = false;
let activeModalCloseCallback = null;
let skipTimerInterval = null;


const hangmanPartIds = [
    "part-head",      
    "part-body",      
    "part-left-arm",  
    "part-right-arm", 
    "part-left-leg",  
    "part-right-leg"  
];




const gameContainer = document.getElementById("gameContainer");
const bossBadge = document.getElementById("bossBadge");
const roundDisplay = document.getElementById("roundDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const categorySelect = document.getElementById("categorySelect");
const activeCategoryName = document.getElementById("activeCategoryName");
const comboBox = document.getElementById("comboBox");
const comboText = document.getElementById("comboText");
const reactionEmoji = document.getElementById("reactionEmoji");
const reactionStatus = document.getElementById("reactionStatus");
const heartsRow = document.getElementById("heartsRow");
const hangmanSvg = document.getElementById("hangmanSvg");
const wordBlanks = document.getElementById("wordBlanks");
const wrongLettersList = document.getElementById("wrongLettersList");
const powerUpBtn = document.getElementById("powerUpBtn");
const powerUpCount = document.getElementById("powerUpCount");
const keyboard = document.getElementById("keyboard");
const toast = document.getElementById("toast");


const videoModal = document.getElementById("videoModal");
const videoModalTitle = document.getElementById("videoModalTitle");
const memeVideo = document.getElementById("memeVideo");
const videoFallback = document.getElementById("videoFallback");
const fallbackTitle = document.getElementById("fallbackTitle");
const fallbackMsg = document.getElementById("fallbackMsg");
const skipVideoBtn = document.getElementById("skipVideoBtn");
const closeVideoBtn = document.getElementById("closeVideoBtn");


const winModal = document.getElementById("winModal");
const winWordDisplay = document.getElementById("winWordDisplay");
const winRoundPoints = document.getElementById("winRoundPoints");
const winTotalScore = document.getElementById("winTotalScore");
const nextRoundBtn = document.getElementById("nextRoundBtn");

const gameOverModal = document.getElementById("gameOverModal");
const loseWordDisplay = document.getElementById("loseWordDisplay");
const finalScore = document.getElementById("finalScore");
const roundsSurvived = document.getElementById("roundsSurvived");
const playAgainBtn = document.getElementById("playAgainBtn");




function initGame() {
    loadHighScore();
    buildKeyboard();
    setupEventListeners();
    startNewRound();
}


function loadHighScore() {
    const saved = localStorage.getItem("hangman_high_score");
    if (saved) {
        highScore = parseInt(saved, 10) || 0;
    } else {
        highScore = 0;
    }
    highScoreDisplay.textContent = highScore;
}


function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem("hangman_high_score", highScore.toString());
    }
}


function isBossRound() {
    return round % 5 === 0;
}




function startNewRound() {
    isGameOver = false;
    isRoundWon = false;
    lives = MAX_LIVES;
    combo = 0;
    guessedLetters.clear();
    wrongLetters = [];

    
    if (isBossRound()) {
        bossBadge.classList.add("show");
        gameContainer.classList.add("boss-active");
        showToast("🔥 BOSS ROUND: Harder word! Beware of boss punishment!");
    } else {
        bossBadge.classList.remove("show");
        gameContainer.classList.remove("boss-active");
    }

    pickWord();
    updateWordDisplay();
    updateHangmanGraphic();
    updateHearts();
    updateReaction();
    updateComboDisplay();
    updateWrongLettersDisplay();
    resetKeyboardKeys();
    updateStatsDisplay();
}


function pickWord() {
    if (isBossRound()) {
        currentCategory = "Boss Concept";
        const randomIndex = Math.floor(Math.random() * BOSS_WORDS.length);
        currentWord = BOSS_WORDS[randomIndex].toUpperCase();
    } else {
        if (selectedCategoryOption === "Random") {
            const categories = Object.keys(WORD_CATEGORIES);
            currentCategory = categories[Math.floor(Math.random() * categories.length)];
        } else {
            currentCategory = selectedCategoryOption;
        }
        const words = WORD_CATEGORIES[currentCategory];
        const randomIndex = Math.floor(Math.random() * words.length);
        currentWord = words[randomIndex].toUpperCase();
    }
    activeCategoryName.textContent = currentCategory;
}






function updateWordDisplay() {
    wordBlanks.innerHTML = "";
    for (let i = 0; i < currentWord.length; i++) {
        const letter = currentWord[i];
        const slot = document.createElement("div");
        slot.className = "letter-slot";
        if (guessedLetters.has(letter)) {
            slot.textContent = letter;
            slot.classList.add("revealed");
        } else {
            slot.textContent = "";
        }
        wordBlanks.appendChild(slot);
    }
}


function updateHangmanGraphic() {
    const mistakes = MAX_LIVES - lives;
    
    
    if (lives <= 1) {
        hangmanSvg.classList.add("danger");
    } else {
        hangmanSvg.classList.remove("danger");
    }

    
    hangmanPartIds.forEach((partId, index) => {
        const part = document.getElementById(partId);
        if (part) {
            if (index < mistakes) {
                part.classList.add("visible");
            } else {
                part.classList.remove("visible");
            }
        }
    });
}


function updateHearts() {
    const hearts = heartsRow.querySelectorAll(".heart");
    hearts.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove("lost");
        } else {
            heart.classList.add("lost");
        }
    });
}


function updateComboDisplay() {
    let multiplier = 1;
    if (combo >= 5) {
        multiplier = 3;
    } else if (combo >= 3) {
        multiplier = 2;
    }

    comboText.textContent = `COMBO: ${combo} (x${multiplier})`;

    if (multiplier > 1) {
        comboBox.classList.add("boosted");
    } else {
        comboBox.classList.remove("boosted");
    }
}


function updateReaction() {
    if (isRoundWon) {
        reactionEmoji.textContent = "😎";
        reactionStatus.textContent = "Victory!";
        return;
    }
    if (lives <= 0) {
        reactionEmoji.textContent = "💀";
        reactionStatus.textContent = "Game Over!";
        return;
    }

    if (lives === 6) {
        reactionEmoji.textContent = "😐";
        reactionStatus.textContent = "Ready to play";
    } else if (lives >= 4) {
        reactionEmoji.textContent = "😕";
        reactionStatus.textContent = "Careful now...";
    } else if (lives >= 2) {
        reactionEmoji.textContent = "😠";
        reactionStatus.textContent = "Getting close!";
    } else if (lives === 1) {
        reactionEmoji.textContent = "😡";
        reactionStatus.textContent = "1 life left! Danger!";
    }
}


function updateWrongLettersDisplay() {
    if (wrongLetters.length === 0) {
        wrongLettersList.innerHTML = '<span class="none-text">None</span>';
        return;
    }
    wrongLettersList.innerHTML = "";
    wrongLetters.forEach(letter => {
        const pill = document.createElement("span");
        pill.className = "wrong-letter-pill";
        pill.textContent = letter;
        wrongLettersList.appendChild(pill);
    });
}


function updateStatsDisplay() {
    roundDisplay.textContent = round;
    scoreDisplay.textContent = score;
    powerUpCount.textContent = `${powerUpsRemaining} LEFT`;
    powerUpBtn.disabled = powerUpsRemaining <= 0;
    saveHighScore();
}




const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

function buildKeyboard() {
    keyboard.innerHTML = "";
    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";
        row.forEach(letter => {
            const btn = document.createElement("button");
            btn.className = "key-btn";
            btn.textContent = letter;
            btn.id = `key-${letter}`;
            btn.addEventListener("click", () => handleGuess(letter));
            rowDiv.appendChild(btn);
        });
        keyboard.appendChild(rowDiv);
    });
}

function resetKeyboardKeys() {
    const keys = keyboard.querySelectorAll(".key-btn");
    keys.forEach(btn => {
        btn.disabled = false;
        btn.className = "key-btn";
    });
}

function disableKey(letter, statusClass) {
    const btn = document.getElementById(`key-${letter}`);
    if (btn) {
        btn.disabled = true;
        btn.classList.add(statusClass);
    }
}




function handleGuess(letter) {
    
    if (isGameOver || isRoundWon || guessedLetters.has(letter) || wrongLetters.includes(letter)) {
        return;
    }
    if (videoModal.classList.contains("active")) {
        return;
    }

    if (currentWord.includes(letter)) {
        
        guessedLetters.add(letter);
        disableKey(letter, "correct");

        
        combo++;
        let multiplier = 1;
        if (combo >= 5) {
            multiplier = 3;
        } else if (combo >= 3) {
            multiplier = 2;
        }

        const pointsEarned = 50 * multiplier;
        score += pointsEarned;

        updateWordDisplay();
        updateComboDisplay();
        updateStatsDisplay();

        
        checkWinCondition();
    } else {
        
        wrongLetters.push(letter);
        disableKey(letter, "wrong");

        
        combo = 0;
        updateComboDisplay();

        
        lives--;
        updateHangmanGraphic();
        updateHearts();
        updateReaction();
        updateWrongLettersDisplay();

        
        gameContainer.classList.add("shake");
        setTimeout(() => gameContainer.classList.remove("shake"), 400);

        
        if (lives <= 0) {
            handleGameOver();
        } else {
            
            triggerMemePunishment();
        }
    }
}




function checkWinCondition() {
    let allGuessed = true;
    for (let i = 0; i < currentWord.length; i++) {
        if (!guessedLetters.has(currentWord[i])) {
            allGuessed = false;
            break;
        }
    }

    if (allGuessed) {
        isRoundWon = true;
        updateReaction();

        
        let roundBonus = 200 + (lives * 50);
        if (isBossRound()) {
            roundBonus += 1000; 
        }
        score += roundBonus;
        updateStatsDisplay();

        
        playVideoModal(
            REWARD_VIDEO,
            isBossRound() ? "👑 BOSS DEFEATED REWARD!" : "🎉 ROUND CLEARED REWARD!",
            3,
            () => {
                showWinModal(roundBonus);
            }
        );
    }
}

function showWinModal(roundBonus) {
    winWordDisplay.textContent = currentWord;
    winRoundPoints.textContent = `+${roundBonus}`;
    winTotalScore.textContent = score;
    winModal.classList.add("active");
}

function handleGameOver() {
    isGameOver = true;
    updateReaction();
    updateStatsDisplay();

    
    playVideoModal(
        RAGE_VIDEO,
        "💀 RAGE QUIT PUNISHMENT",
        3,
        () => {
            loseWordDisplay.textContent = currentWord;
            finalScore.textContent = score;
            roundsSurvived.textContent = round;
            gameOverModal.classList.add("active");
        }
    );
}




function usePowerUp() {
    if (isGameOver || isRoundWon) return;
    if (powerUpsRemaining <= 0) {
        showToast("⚠️ No power-ups remaining!");
        return;
    }

    powerUpsRemaining--;
    updateStatsDisplay();

    
    
    
    
    
    const effectIndex = Math.floor(Math.random() * 4);

    switch (effectIndex) {
        case 0: {
            
            const unrevealedLetters = [];
            for (let i = 0; i < currentWord.length; i++) {
                const char = currentWord[i];
                if (!guessedLetters.has(char) && !unrevealedLetters.includes(char)) {
                    unrevealedLetters.push(char);
                }
            }
            if (unrevealedLetters.length > 0) {
                const letterToReveal = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
                showToast(`⚡ Power-Up: Revealed letter "${letterToReveal}"!`);
                handleGuess(letterToReveal);
            } else {
                score += 150;
                showToast("⚡ Power-Up: All letters revealed! +150 Points!");
                updateStatsDisplay();
            }
            break;
        }

        case 1: {
            
            if (lives < MAX_LIVES) {
                lives++;
                updateHangmanGraphic();
                updateHearts();
                updateReaction();
                showToast("❤️ Power-Up: Restored 1 Life!");
            } else {
                score += 200;
                showToast("❤️ Power-Up: Max Lives! Converted to +200 Points!");
                updateStatsDisplay();
            }
            break;
        }

        case 2: {
            
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
            const candidates = alphabet.filter(char => 
                !currentWord.includes(char) && 
                !wrongLetters.includes(char) &&
                !document.getElementById(`key-${char}`)?.classList.contains("eliminated")
            );

            if (candidates.length > 0) {
                
                candidates.sort(() => 0.5 - Math.random());
                const toRemove = candidates.slice(0, 3);
                toRemove.forEach(char => disableKey(char, "eliminated"));
                showToast(`🚫 Power-Up: Eliminated wrong letters [${toRemove.join(", ")}]!`);
            } else {
                score += 100;
                showToast("🚫 Power-Up: No letters to remove! +100 Points!");
                updateStatsDisplay();
            }
            break;
        }

        case 3: {
            
            showToast("🔄 Power-Up: Rerolled a new word!");
            pickWord();
            guessedLetters.clear();
            wrongLetters = [];
            updateWordDisplay();
            updateWrongLettersDisplay();
            resetKeyboardKeys();
            break;
        }
    }
}




function triggerMemePunishment() {
    let videoToPlay = "";
    let title = "";

    if (isBossRound()) {
        videoToPlay = BOSS_VIDEO;
        title = "👹 BOSS PUNISHMENT!";
    } else {
        const randomIndex = Math.floor(Math.random() * MEME_VIDEOS.length);
        videoToPlay = MEME_VIDEOS[randomIndex];
        title = "⚠️ YOU'RE WRONG!";
    }

    playVideoModal(videoToPlay, title, 3);
}

function playVideoModal(videoSrc, title, autoSkipSeconds = 3, onCloseCallback = null) {
    activeModalCloseCallback = onCloseCallback;
    videoModalTitle.textContent = title;

    // Reset timer and video state
    clearInterval(skipTimerInterval);
    clearTimeout(skipTimerInterval);
    memeVideo.pause();
    memeVideo.currentTime = 0;
    memeVideo.muted = false;

    // Immediately display video element and hide placeholder
    memeVideo.classList.add("has-video");
    videoFallback.style.display = "none";

    const fileName = videoSrc.split("/").pop();
    fallbackTitle.textContent = title;
    fallbackMsg.textContent = `Playing ${fileName}`;

    let isPlaybackStarted = false;
    const attemptPlay = () => {
        if (isPlaybackStarted) return;
        isPlaybackStarted = true;
        memeVideo.classList.add("has-video");
        videoFallback.style.display = "none";

        const playPromise = memeVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch((err) => {
                // If browser blocks unmuted autoplay, retry with muted audio
                console.warn("Autoplay with sound blocked, trying muted:", err);
                memeVideo.muted = true;
                memeVideo.play().catch((e) => {
                    console.error("Playback failed:", e);
                });
            });
        }
    };

    // Listen for loaded data / canplay events
    memeVideo.onloadeddata = attemptPlay;
    memeVideo.oncanplay = attemptPlay;

    // Only display fallback card if video genuinely fails to load
    memeVideo.onerror = () => {
        memeVideo.classList.remove("has-video");
        videoFallback.style.display = "flex";
        fallbackTitle.textContent = title;
        fallbackMsg.textContent = `Could not load ${fileName}. Make sure ${fileName} is in the game folder.`;

        // Start fallback countdown so player is not stuck
        let countdown = autoSkipSeconds;
        skipVideoBtn.textContent = `Skip (${countdown}s)`;
        clearInterval(skipTimerInterval);
        skipTimerInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                skipVideoBtn.textContent = `Skip (${countdown}s)`;
            } else {
                clearInterval(skipTimerInterval);
                closeVideoModal();
            }
        }, 1000);
    };

    // Close modal when video finishes playing
    memeVideo.onended = () => {
        setTimeout(closeVideoModal, 400);
    };

    // Load and play video source
    memeVideo.src = videoSrc;
    memeVideo.load();

    if (memeVideo.readyState >= 2) {
        attemptPlay();
    }

    // Default skip button text
    skipVideoBtn.textContent = "Skip";

    // Safety timeout: auto-close if video takes more than 15s or gets stuck
    skipTimerInterval = setTimeout(() => {
        closeVideoModal();
    }, 15000);

    videoModal.classList.add("active");
}

function closeVideoModal() {
    clearInterval(skipTimerInterval);
    clearTimeout(skipTimerInterval);
    videoModal.classList.remove("active");
    memeVideo.pause();
    memeVideo.currentTime = 0;
    memeVideo.removeAttribute("src");
    memeVideo.load();

    if (activeModalCloseCallback) {
        const callback = activeModalCloseCallback;
        activeModalCloseCallback = null;
        callback();
    }
}




let toastTimer = null;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}




function setupEventListeners() {
    
    window.addEventListener("keydown", (e) => {
        if (/^[a-zA-Z]$/.test(e.key)) {
            handleGuess(e.key.toUpperCase());
        }
    });

    
    categorySelect.addEventListener("change", (e) => {
        selectedCategoryOption = e.target.value;
        showToast(`Category set to: ${selectedCategoryOption}`);
        startNewRound();
    });

    
    powerUpBtn.addEventListener("click", usePowerUp);

    
    skipVideoBtn.addEventListener("click", closeVideoModal);
    closeVideoBtn.addEventListener("click", closeVideoModal);

    
    nextRoundBtn.addEventListener("click", () => {
        winModal.classList.remove("active");
        round++;
        
        if (powerUpsRemaining < 3) {
            powerUpsRemaining++;
            showToast("🎁 Round Bonus: +1 Power-up gained!");
        }
        startNewRound();
    });

    
    playAgainBtn.addEventListener("click", () => {
        gameOverModal.classList.remove("active");
        score = 0;
        round = 1;
        powerUpsRemaining = 3;
        startNewRound();
    });
}


window.addEventListener("DOMContentLoaded", initGame);
