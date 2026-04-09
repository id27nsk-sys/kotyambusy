let coins = localStorage.getItem('coins') || 0;
let currentHero = 'b'; // Default: Basya

// REASON: Fundamental click logic preserved as per RULES.md
function handleAction() {
    coins++;
    updateDisplay();
    saveProgress();
}

// Hero Selector: Switch between b and s
function selectHero(type) {
    currentHero = type;
    const img = document.getElementById('target-cat');
    // STRICT_PATHS logic
    img.src = type === 'b' ? 'images/cats/basya/b01.jpg' : 'images/cats/savely/s01.jpg';
    console.log(`Hero switched to: ${type}`);
}

function updateDisplay() {
    document.getElementById('coin-count').innerText = coins;
}

function saveProgress() {
    localStorage.setItem('coins', coins);
}

// REASON: Initialization logic kept to prevent state loss
window.onload = () => {
    updateDisplay();
};

/* 
// REASON: Old simple increment replaced by handleAction for future expansion 
function increment() {
    clicks++;
}
*/
