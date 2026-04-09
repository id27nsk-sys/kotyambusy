let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentHero = 'b';
let photoIndex = 1;
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;

// REASON: PRELOAD_DETECTION_STRICT - Фиксируем счетчик сразу
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
            updateUI(); // Обновляем UI по мере нахождения новых фото
            checkNext();
        };
        img.onerror = () => { 
            console.log(`🐾 ${type} scan complete: ${count} photos found.`);
            updateUI(); 
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

    // Смена фото каждые 5 поглаживаний
    if (coins % 5 === 0 && !isUpdating) {
        tryNextPhoto();
    }

    if (coins % 100 === 0 && coins !== 0) { showMilestone(); }
}

function tryNextPhoto() {
    isUpdating = true;
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    
    // REASON: Цикл строго по реально обнаруженным фото
    let max = totalPhotosDetected[currentHero];
    photoIndex = (photoIndex % max) + 1;
    
    let fmtIdx = photoIndex < 10 ? `0${photoIndex}` : photoIndex;
    const catImg = document.getElementById('target-cat');
    
    // Предзагрузка перед сменой, чтобы не было "мигания"
    const nextImg = new Image();
    nextImg.onload = () => {
        catImg.src = nextImg.src;
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
    const coinDisplay = document.getElementById('coin-count');
    const photoDisplay = document.getElementById('photo-stat');
    
    if (coinDisplay) coinDisplay.innerText = coins;
    if (photoDisplay) {
        // Гарантируем, что photoIndex не больше найденного total
        let currentTotal = totalPhotosDetected[currentHero];
        photoDisplay.innerText = `${photoIndex}/${currentTotal}`;
    }
}

function createPaw(e) {
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = '🐾';
    paw.style.left = `${e.clientX}px`;
    paw.style.top = `${e.clientY}px`;
    const dX = (Math.random() - 0.5) * 300;
    const dY = (Math.random() - 0.5) * 300;
    paw.style.setProperty('--x', `${dX}px`);
    paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${Math.random() * 360}deg`);
    document.body.appendChild(paw);
    paw.addEventListener('animationend', () => paw.remove());
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0; photoIndex = 1;
        localStorage.clear();
        updateUI();
        selectHero(currentHero);
    }
}

function saveData() { localStorage.setItem('coins', coins); }
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
