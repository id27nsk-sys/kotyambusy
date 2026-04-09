let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentHero = 'b';

// REASON: DESTRUCTIVE_EDIT_FORBIDDEN - Core logic preserved
function handleAction() {
    coins++;
    updateUI();
    saveData();
}

// Hero Selector: Instant switch (b/s)
function selectHero(type) {
    currentHero = type;
    const catImg = document.getElementById('target-cat');
    
    // REASON: STRICT_PATHS adherence
    catImg.src = type === 'b' ? 'images/cats/basya/b01.jpg' : 'images/cats/savely/s01.jpg';
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
}

function saveData() {
    localStorage.setItem('coins', coins);
}

function resetAll() {
    // REASON: Clean state required for testing
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0;
        localStorage.clear();
        updateUI();
    }
}

window.onload = updateUI;

/* 
// REASON: Deprecated simple clicks, moved to handleAction 
function increment() { clicks++; } 
*/
