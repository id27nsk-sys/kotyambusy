/**
 * Kotyambusy Engine v2.6 (Complete Restoration)
 * Соблюдение RULES.md: Чистый JS, верные пути, полная поддержка HTML.
 */

const APP_CONFIG = {
    PATHS: {
        SAVELY: 'images/cats/savely/',
        BASYA: 'images/cats/basya/',
        KUS: 'images/KUS.webp'
    },
    PREFIXES: {
        savely: 's',
        basya: 'b'
    },
    GAMEPLAY: {
        WORKSHOP_CODE: '1111'
    }
};

// --- СОСТОЯНИЕ ИГРЫ ---
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let currentCat = localStorage.getItem('currentCat') || 'basya';
let isKusActive = false;
let nextKusThreshold = clicks + 10;

let photoIndices = {
    basya: parseInt(localStorage.getItem('basya_idx')) || 1,
    savely: parseInt(localStorage.getItem('savely_idx')) || 1
};

const milestones = [10, 50, 100, 500, 1000];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function getCatPhotoPath(cat, index) {
    const prefix = APP_CONFIG.PREFIXES[cat];
    const fileName = `${prefix}${index.toString().padStart(2, '0')}.webp`;
    return `${APP_CONFIG.PATHS[cat.toUpperCase()]}${fileName}`;
}

function updateUI() {
    const clickCountEl = document.getElementById('click-count');
    const catNameEl = document.getElementById('cat-name');
    const counterEl = document.getElementById('photo-counter');
    
    if (clickCountEl) clickCountEl.textContent = clicks;
    if (catNameEl) catNameEl.textContent = currentCat.toUpperCase();
    if (counterEl) counterEl.textContent = `Фото: ${photoIndices[currentCat]}`;
    document.title = `Котямбусы: ${clicks}`;
}

// --- ЛОГИКА КЛИКА И ФОТО ---
function handleInteraction(event) {
    if (isKusActive) return;

    clicks++;
    
    // Координаты для лапок
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    const y = event.clientY || (event.touches && event.touches[0].clientY);
    if (x && y) createPaw(x, y);

    if (milestones.includes(clicks)) showMilestone(clicks);

    if (clicks >= nextKusThreshold) {
        triggerKus();
    } else {
        changePhoto();
    }

    saveGame();
    updateUI();
}

function changePhoto() {
    const cat = currentCat;
    photoIndices[cat]++;
    
    const nextSrc = getCatPhotoPath(cat, photoIndices[cat]);
    const imgTest = new Image();
    
    imgTest.onload = () => {
        document.getElementById('cat-img').src = nextSrc;
    };
    imgTest.onerror = () => {
        photoIndices[cat] = 1;
        document.getElementById('cat-img').src = getCatPhotoPath(cat, 1);
    };
    imgTest.src = nextSrc;
}

function triggerKus() {
    isKusActive = true;
    const catImg = document.getElementById('cat-img');
    const oldSrc = catImg.src;
    
    catImg.src = APP_CONFIG.PATHS.KUS;
    document.body.classList.add('shake-effect');
    
    setTimeout(() => {
        catImg.src = oldSrc;
        isKusActive = false;
        document.body.classList.remove('shake-effect');
        nextKusThreshold = clicks + Math.floor(Math.random() * 15) + 5;
    }, 1500);
}

// --- ВИЗУАЛЬНЫЕ ЭФФЕКТЫ ---
function createPaw(x, y) {
    const paw = document.createElement('div');
    paw.className = 'paw';
    paw.style.left = `${x - 20}px`;
    paw.style.top = `${y - 20}px`;
    paw.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 1000);
}

function showMilestone(count) {
    const msg = document.createElement('div');
    msg.className = 'milestone-notif';
    msg.textContent = `Достижение: ${count} кусей!`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

// --- УПРАВЛЕНИЕ И ИНТЕРФЕЙС (Для кнопок в HTML) ---
function switchCat(cat) {
    currentCat = cat;
    document.getElementById('cat-img').src = getCatPhotoPath(cat, photoIndices[cat]);
    saveGame();
    updateUI();
}

function resetProgress() {
    if (confirm("Сбросить прогресс?")) {
        clicks = 0;
        photoIndices = { basya: 1, savely: 1 };
        localStorage.clear();
        location.reload();
    }
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// --- МАСТЕРСКАЯ (WORKSHOP) ---
function initWorkshop() {
    const codeInput = document.getElementById('workshop-code');
    if (codeInput) {
        codeInput.addEventListener('input', (e) => {
            if (e.target.value === APP_CONFIG.GAMEPLAY.WORKSHOP_CODE) {
                const panel = document.getElementById('workshop-panel');
                if (panel) panel.style.display = 'block';
            }
        });
    }
}

function exportPhoto() {
    const canvas = document.getElementById('workshop-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `edit_${currentCat}_${photoIndices[currentCat]}.webp`;
    link.href = canvas.toDataURL('image/webp');
    link.click();
}

// --- СОХРАНЕНИЕ ---
function saveGame() {
    localStorage.setItem('clicks', clicks);
    localStorage.setItem('currentCat', currentCat);
    localStorage.setItem('basya_idx', photoIndices.basya);
    localStorage.setItem('savely_idx', photoIndices.savely);
}

// --- СТАРТ ---
window.onload = () => {
    updateUI();
    document.getElementById('cat-img').src = getCatPhotoPath(currentCat, photoIndices[currentCat]);
    initWorkshop();
};
