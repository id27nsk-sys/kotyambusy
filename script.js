let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentHero = 'b';
let photoIndex = 1;

// REASON: DYNAMIC_DETECT_STRICT - Храним реально обнаруженное кол-во фото
let totalPhotosDetected = { 'b': 1, 's': 1 };

function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    if (event) createPaw(event);

    if (coins % 5 === 0) {
        tryNextPhoto();
    }

    if (coins % 100 === 0 && coins !== 0) {
        showMilestone();
    }
}

// REASON: DYNAMIC_DETECT_STRICT - Автоматический поиск следующего фото
function tryNextPhoto() {
    const catImg = document.getElementById('target-cat');
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    
    let nextIdx = photoIndex + 1;
    let fmtIdx = nextIdx < 10 ? `0${nextIdx}` : nextIdx;
    let nextSrc = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;

    // REASON: Проверка существования файла без жестких лимитов в коде
    const tester = new Image();
    tester.onload = () => {
        photoIndex = nextIdx;
        catImg.src = nextSrc;
        if (photoIndex > totalPhotosDetected[currentHero]) {
            totalPhotosDetected[currentHero] = photoIndex;
        }
        updateUI();
    };
    tester.onerror = () => {
        // Если файла bXX.jpg не существует — сброс цикла в начало
        photoIndex = 1;
        catImg.src = `images/cats/${folder}/${prefix}01.jpg`;
        updateUI();
    };
    tester.src = nextSrc;
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('photo-stat').innerText = `${photoIndex}/${totalPhotosDetected[currentHero]}`;
}

function selectHero(type) {
    currentHero = type;
    photoIndex = 1;
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    document.getElementById('target-cat').src = `images/cats/${folder}/${prefix}01.jpg`;
    updateUI();
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

function showMilestone() {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
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
        selectHero(currentHero);
    }
}

window.onload = () => {
    updateUI();
};
