/**
 * Kotyambusy Engine v2.3 (Full Restoration)
 * Чистый JS, адаптив, мастерская и достижения включены.
 */

const APP_CONFIG = {
    PATHS: {
        SAVELY: 'images/cats/savely/',
        BASYA: 'images/cats/basya/',
        KUS: 'images/KUS.webp',
        EXT: '.webp'
    },
    PREFIXES: {
        SAVELY: 's',
        BASYA: 'b'
    },
    GAMEPLAY: {
        KUS_DURATION: 1500,
        PAW_LIFETIME: 1000,
        WORKSHOP_CODE: '1111'
    }
};

// Состояние
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let currentCat = localStorage.getItem('currentCat') || 'savely';
let isKusActive = false;
let nextKusThreshold = clicks + 10;
const state = {
    savely: 1,
    basya: 1,
    cache: { savely: new Image(), basya: new Image() }
};

const milestones = [10, 50, 100, 500, 1000, 5000];

// DOM Элементы
const catImg = document.getElementById('cat-img');
const clickCountEl = document.getElementById('click-count');

/** Вспомогательные функции путей **/
function getFileName(cat, index) {
    const prefix = APP_CONFIG.PREFIXES[cat.toUpperCase()];
    return `${prefix}${index.toString().padStart(2, '0')}${APP_CONFIG.PATHS.EXT}`;
}

function getFullPath(cat, index) {
    return `${APP_CONFIG.PATHS[cat.toUpperCase()]}${getFileName(cat, index)}`;
}

/** Игровая логика **/
function initPreload() {
    ['savely', 'basya'].forEach(cat => {
        state.cache[cat].src = getFullPath(cat, 2);
    });
}

function nextPhoto() {
    const cat = currentCat;
    if (state.cache[cat].complete && state.cache[cat].naturalWidth !== 0) {
        state[cat]++;
        catImg.src = state.cache[cat].src;
    } else {
        state[cat] = 1;
        catImg.src = getFullPath(cat, 1);
    }
    const nextIdx = state[cat] + 1;
    state.cache[cat] = new Image();
    state.cache[cat].src = getFullPath(cat, nextIdx);
}

function showMilestone(count) {
    const msg = document.createElement('div');
    msg.className = 'milestone-notif';
    msg.textContent = `Достижение: ${count} кусей!`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

function createPaw(x, y) {
    const paw = document.createElement('div');
    paw.className = 'paw';
    paw.style.left = `${x - 20}px`;
    paw.style.top = `${y - 20}px`;
    paw.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(paw);
    setTimeout(() => {
        paw.style.opacity = '0';
        setTimeout(() => paw.remove(), 500);
    }, APP_CONFIG.GAMEPLAY.PAW_LIFETIME);
}

function handleInteraction(e) {
    if (isKusActive) return;
    clicks++;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX && clientY) createPaw(clientX, clientY);

    if (milestones.includes(clicks)) showMilestone(clicks);

    if (clicks >= nextKusThreshold) {
        isKusActive = true;
        const oldSrc = catImg.src;
        catImg.src = APP_CONFIG.PATHS.KUS;
        document.body.classList.add('shake-effect');
        setTimeout(() => {
            catImg.src = oldSrc;
            isKusActive = false;
            document.body.classList.remove('shake-effect');
            nextKusThreshold = clicks + Math.floor(Math.random() * 15) + 5;
        }, APP_CONFIG.GAMEPLAY.KUS_DURATION);
    } else {
        nextPhoto();
    }

    if (clickCountEl) clickCountEl.textContent = clicks;
    document.title = `Котямбусы: ${clicks}`;
    localStorage.setItem('clicks', clicks);
}

/** Мастерская (Workshop) **/
function initWorkshop() {
    const codeInput = document.getElementById('workshop-code');
    if (!codeInput) return;

    codeInput.addEventListener('input', (e) => {
        if (e.target.value === APP_CONFIG.GAMEPLAY.WORKSHOP_CODE) {
            document.getElementById('workshop-panel').style.display = 'block';
        }
    });
}

// Функции экспорта и обрезки (твоя оригинальная логика)
function exportPhoto() {
    const canvas = document.getElementById('workshop-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = getFileName(currentCat, state[currentCat]);
    link.href = canvas.toDataURL('image/webp');
    link.click();
}

/** Запуск **/
document.addEventListener('DOMContentLoaded', () => {
    initPreload();
    initWorkshop();
    
    if (catImg) {
        catImg.addEventListener('mousedown', handleInteraction);
        catImg.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInteraction(e);
        }, { passive: false });
    }
});
