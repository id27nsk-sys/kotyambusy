/**
 * Kotyambusy Engine v2.7 (Hard Fix)
 * Соответствует RULES.md: images/cats/basya/b01.webp
 */

// Глобальный конфиг
const APP_CONFIG = {
    PATHS: {
        basya: 'images/cats/basya/',
        savely: 'images/cats/savely/',
        KUS: 'images/KUS.webp'
    },
    PREFIX: {
        basya: 'b',
        savely: 's'
    }
};

// Состояние (грузим из памяти)
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let currentCat = localStorage.getItem('currentCat') || 'basya';
let isKusActive = false;
let nextKusThreshold = clicks + 5;

let photoIndices = {
    basya: parseInt(localStorage.getItem('basya_idx')) || 1,
    savely: parseInt(localStorage.getItem('savely_idx')) || 1
};

const milestones = [10, 50, 100, 500, 1000];

// 1. Вспомогательная функция путей
function getPath(cat, index) {
    const p = APP_CONFIG.PREFIX[cat];
    const idx = index.toString().padStart(2, '0');
    return `${APP_CONFIG.PATHS[cat]}${p}${idx}.webp`;
}

// 2. Обновление интерфейса
function updateUI() {
    const clickEl = document.getElementById('click-count');
    const nameEl = document.getElementById('cat-name');
    const countEl = document.getElementById('photo-counter');
    
    if (clickEl) clickEl.textContent = clicks;
    if (nameEl) nameEl.textContent = currentCat.toUpperCase();
    if (countEl) countEl.textContent = `Фото: ${photoIndices[currentCat]}`;
    
    document.title = `Котямбусы: ${clicks}`;
}

// 3. Главная функция клика (вызывается из HTML через onclick)
function handleInteraction(event) {
    if (isKusActive) return;

    clicks++;
    
    // Координаты лапок
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    const y = event.clientY || (event.touches && event.touches[0].clientY);
    if (x && y) createPaw(x, y);

    // Достижения
    if (milestones.includes(clicks)) showMilestone(clicks);

    // Кусь или фото
    if (clicks >= nextKusThreshold) {
        triggerKus();
    } else {
        const cat = currentCat;
        photoIndices[cat]++;
        
        const nextSrc = getPath(cat, photoIndices[cat]);
        const testImg = new Image();
        testImg.onload = () => {
            document.getElementById('cat-img').src = nextSrc;
        };
        testImg.onerror = () => {
            photoIndices[cat] = 1;
            document.getElementById('cat-img').src = getPath(cat, 1);
        };
        testImg.src = nextSrc;
    }

    save();
    updateUI();
}

// 4. Механика КУСЬ
function triggerKus() {
    isKusActive = true;
    const img = document.getElementById('cat-img');
    const oldSrc = img.src;
    
    img.src = APP_CONFIG.PATHS.KUS;
    document.body.classList.add('shake-effect');
    
    setTimeout(() => {
        img.src = oldSrc;
        isKusActive = false;
        document.body.classList.remove('shake-effect');
        nextKusThreshold = clicks + Math.floor(Math.random() * 10) + 5;
    }, 1000);
}

// 5. Кнопки переключения
function switchCat(cat) {
    currentCat = cat;
    document.getElementById('cat-img').src = getPath(cat, photoIndices[cat]);
    save();
    updateUI();
}

function resetProgress() {
    if (confirm("Сбросить всё?")) {
        localStorage.clear();
        location.reload();
    }
}

function toggleSettings() {
    const p = document.getElementById('settings-panel');
    if (p) p.style.display = (p.style.display === 'block') ? 'none' : 'block';
}

// 6. Визуал
function createPaw(x, y) {
    const paw = document.createElement('div');
    paw.className = 'paw';
    paw.style.left = (x - 20) + 'px';
    paw.style.top = (y - 20) + 'px';
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 800);
}

function showMilestone(c) {
    const n = document.createElement('div');
    n.className = 'milestone-notif';
    n.textContent = `Достижение: ${c}!`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

function save() {
    localStorage.setItem('clicks', clicks);
    localStorage.setItem('currentCat', currentCat);
    localStorage.setItem('basya_idx', photoIndices.basya);
    localStorage.setItem('savely_idx', photoIndices.savely);
}

// Мастерская
function checkCode(val) {
    if (val === '1111') {
        const p = document.getElementById('workshop-panel');
        if (p) p.style.display = 'block';
    }
}

// Инициализация
window.onload = () => {
    updateUI();
    const mainImg = document.getElementById('cat-img');
    if (mainImg) mainImg.src = getPath(currentCat, photoIndices[currentCat]);
    
    // Привязка кода воркшопа
    const codeInp = document.getElementById('workshop-code');
    if (codeInp) codeInp.oninput = (e) => checkCode(e.target.value);
};
