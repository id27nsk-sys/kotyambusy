// DATA_INTEGRITY_STRICT: Валидация при старте
let coins = parseInt(localStorage.getItem('coins')) || 0;
let maxUnlocked = { 'b': 1, 's': 1 };
try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { 
    // REASON: Сохранение стабильности при повреждении данных
    console.error("🐾 Data corrupted, using defaults"); 
}

let currentHero = 'b';
let photoIndex = 1;
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;

// PRELOAD_DETECTION_STRICT: Рекурсивное фоновое сканирование архива
function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    let count = 1;

    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;
        const img = new Image();
        img.onload = () => { 
            count++; 
            totalPhotosDetected[type] = count; 
            updateUI(); 
            checkNext(); 
        };
        img.src = src;
    }
    checkNext();
}

function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    if (event) createPaw(event);

    // PHOTO_CYCLE_STRICT & ASYNC_GUARD_STRICT
    if (coins % 5 === 0 && !isUpdating) { 
        tryNextPhoto(); 
    }
    
    // MILESTONE_CELEBRATION
    if (coins % 100 === 0 && coins !== 0) { 
        showMilestone(); 
    }
}

function tryNextPhoto() {
    isUpdating = true;
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    
    let maxDetected = totalPhotosDetected[currentHero];
    photoIndex = (photoIndex % maxDetected) + 1;
    
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
    if (isUpdating) return;
    currentHero = type;
    photoIndex = 1;
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    document.getElementById('target-cat').src = `images/cats/${folder}/${prefix}01.jpg`;
    updateUI();
}

function updateUI() {
    const coinDisplay = document.getElementById('coin-count');
    const photoDisplay = document.getElementById('photo-stat');
    
    if (coinDisplay) coinDisplay.innerText = coins;
    if (photoDisplay) {
        const total = totalPhotosDetected[currentHero];
        const unlocked = maxUnlocked[currentHero];
        photoDisplay.innerText = `${unlocked}/${total}`;
    }
}

// DOM_LEAK_TEST: Оптимизированное создание частиц
function createPaw(e) {
    // REASON: Защита от переполнения DOM при спам-кликах
    if (document.querySelectorAll('.paw-particle').length > 20) return;

    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = '🐾';

    // Поддержка координат для Mouse и Touch (ADAPTIVE_STRICT)
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;

    const dX = (Math.random() - 0.5) * 300;
    const dY = (Math.random() - 0.5) * 300;
    const rot = Math.random() * 360;

    paw.style.setProperty('--x', `${dX}px`);
    paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${rot}deg`);

    document.body.appendChild(paw);

    // REASON: Гарантированная очистка памяти через 700мс
    setTimeout(() => {
        if (paw.parentNode) paw.remove();
    }, 700);
}

function saveData() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked));
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0; 
        photoIndex = 1;
        maxUnlocked = { 'b': 1, 's': 1 };
        localStorage.clear();
        updateUI(); 
        selectHero(currentHero);
    }
}

function showMilestone() {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

window.onload = () => { 
    preloadArchive('b'); 
    preloadArchive('s'); 
    updateUI(); 
};
