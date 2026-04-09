// DATA_INTEGRITY_STRICT: Валидация при старте
let coins = parseInt(localStorage.getItem('coins')) || 0;
let maxUnlocked = { 'b': 1, 's': 1 };
try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { console.error("🐾 Data corrupted, using defaults"); }

let currentHero = 'b';
let photoIndex = 1;
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;

function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    let count = 1;

    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;
        const img = new Image();
        img.onload = () => { count++; totalPhotosDetected[type] = count; updateUI(); checkNext(); };
        img.src = src;
    }
    checkNext();
}

function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    if (event) createPaw(event);
    // ASYNC_GUARD_STRICT: Блокировка частых смен
    if (coins % 5 === 0 && !isUpdating) { tryNextPhoto(); }
    if (coins % 100 === 0 && coins !== 0) { showMilestone(); }
}

function tryNextPhoto() {
    isUpdating = true;
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    
    photoIndex = (photoIndex % totalPhotosDetected[currentHero]) + 1;
    
    // PROGRESS_ACCUMULATION_STRICT: Фиксация рекорда
    if (photoIndex > maxUnlocked[currentHero]) {
        maxUnlocked[currentHero] = photoIndex;
    }
    
    let fmtIdx = photoIndex < 10 ? `0${photoIndex}` : photoIndex;
    const nextImg = new Image();
    nextImg.onload = () => {
        document.getElementById('target-cat').src = nextImg.src;
        updateUI();
        isUpdating = false;
    };
    nextImg.src = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;
}

function selectHero(type) {
    currentHero = type;
    photoIndex = 1;
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    document.getElementById('target-cat').src = `images/cats/${folder}/${prefix}01.jpg`;
    updateUI();
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    // Показываем максимум достигнутого (unlocked), а не текущий индекс
    const total = totalPhotosDetected[currentHero];
    const unlocked = maxUnlocked[currentHero];
    document.getElementById('photo-stat').innerText = `${unlocked}/${total}`;
}

function createPaw(e) {
    const paw = document.createElement('div');
    paw.className = 'paw-particle'; paw.innerHTML = '🐾';
    paw.style.left = `${e.clientX}px`; paw.style.top = `${e.clientY}px`;
    const dX = (Math.random() - 0.5) * 300; const dY = (Math.random() - 0.5) * 300;
    paw.style.setProperty('--x', `${dX}px`); paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${Math.random() * 360}deg`);
    document.body.appendChild(paw);
    paw.addEventListener('animationend', () => paw.remove());
}

function saveData() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked));
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0; photoIndex = 1;
        maxUnlocked = { 'b': 1, 's': 1 };
        localStorage.clear();
        updateUI(); selectHero(currentHero);
    }
}

function showMilestone() {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

window.onload = () => { preloadArchive('b'); preloadArchive('s'); updateUI(); };
