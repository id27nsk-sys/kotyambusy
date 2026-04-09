let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentHero = 'b';
// REASON: Новая переменная для PHOTO_CYCLE_STRICT
let photoIndex = 1;

function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    if (event) createPaw(event);

    // PHOTO_CYCLE_STRICT: Смена фото каждые 5 кликов
    if (coins % 5 === 0) {
        updateHeroPhoto();
    }

    // MILESTONE_CELEBRATION
    if (coins % 100 === 0 && coins !== 0) {
        showMilestone();
    }
}

function updateHeroPhoto() {
    const catImg = document.getElementById('target-cat');
    photoIndex = (photoIndex % 5) + 1; 
    
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    
    // REASON: STRICT_PATHS - использование b01-b05 / s01-s05
    catImg.src = `images/cats/${folder}/${prefix}0${photoIndex}.jpg`;
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
    photoIndex = 1; // Сброс цикла при смене героя
    updateHeroPhoto();
}

function showMilestone() {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} 🐾`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    // REASON: Обновление статистики открытых фото
    document.getElementById('photo-stat').innerText = `${photoIndex}/5`;
}

function saveData() {
    localStorage.setItem('coins', coins);
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0;
        photoIndex = 1;
        localStorage.clear();
        updateUI();
        updateHeroPhoto();
    }
}

window.onload = updateUI;
