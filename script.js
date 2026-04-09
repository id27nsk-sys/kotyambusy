let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentHero = 'b';

// ACTION_CENTERED: Основная логика клика по фото
function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    
    // PAW_PARTICLE_STRICT: Вылет 🐾
    if (event) createPaw(event);
}

function createPaw(e) {
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = '🐾';
    
    paw.style.left = `${e.clientX}px`;
    paw.style.top = `${e.clientY}px`;
    
    const dX = (Math.random() - 0.5) * 400;
    const dY = (Math.random() - 0.5) * 400;
    const rot = Math.random() * 360;

    paw.style.setProperty('--x', `${dX}px`);
    paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${rot}deg`);
    
    document.body.appendChild(paw);
    paw.addEventListener('animationend', () => paw.remove());
}

function selectHero(type) {
    currentHero = type;
    const catImg = document.getElementById('target-cat');
    // STRICT_PATHS
    catImg.src = type === 'b' ? 'images/cats/basya/b01.jpg' : 'images/cats/savely/s01.jpg';
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
}

function saveData() {
    localStorage.setItem('coins', coins);
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0;
        localStorage.clear();
        updateUI();
    }
}

window.onload = updateUI;

/* 
// REASON: Old button click handler removed to adhere to ACTION_CENTERED 
function increment() { clicks++; } 
*/
