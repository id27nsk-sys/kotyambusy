/**
 * Kotyambusy Engine v2.1
 * Стек: Чистый JS (Vanilla)
 * Особенности: Lazy Loading +1, Модульный конфиг, Mobile First logic.
 */

const APP_CONFIG = {
    PATHS: {
        SAVELY: 'images/savely/',
        BASYA: 'images/basya/',
        KUS: 'images/KUS.webp',
        EXT: '.webp'
    },
    GAMEPLAY: {
        KUS_THRESHOLD_BASE: 10,
        KUS_CHANCE: 0.1,
        WORKSHOP_AUTH: '1111'
    },
    UI: {
        PAW_LIFETIME: 1000,
        KUS_DURATION: 1500,
        SHAKE_TIME: 300
    }
};

// Состояние игры
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let currentCat = localStorage.getItem('currentCat') || 'savely';
let isKusActive = false;
let nextKusThreshold = clicks + APP_CONFIG.GAMEPLAY.KUS_THRESHOLD_BASE;

// Состояние индексов и кэша для Lazy Loading
const state = {
    savely: 1,
    basya: 1,
    cache: {
        savely: new Image(),
        basya: new Image()
    }
};

// Элементы DOM
const mainImg = document.getElementById('main-img');
const clickCountEl = document.getElementById('click-count');

/**
 * Инициализация прелоада
 */
function initPreload() {
    ['savely', 'basya'].forEach(cat => {
        // Загружаем второе фото сразу после старта
        const nextSrc = `${APP_CONFIG.PATHS[cat.toUpperCase()]}2${APP_CONFIG.PATHS.EXT}`;
        state.cache[cat].src = nextSrc;
    });
}

/**
 * Умная смена фото (Lazy Loading +1)
 */
function nextPhoto() {
    const cat = currentCat;
    
    // 1. Пытаемся взять фото из кэша
    if (state.cache[cat].complete && state.cache[cat].naturalWidth !== 0) {
        state[cat]++;
        mainImg.src = state.cache[cat].src;
    } else {
        // Если кэш пуст (конец папки или сбой), сбрасываем на 1
        state[cat] = 1;
        mainImg.src = `${APP_CONFIG.PATHS[cat.toUpperCase()]}1${APP_CONFIG.PATHS.EXT}`;
    }

    // 2. Готовим кэш для СЛЕДУЮЩЕГО шага (n + 1)
    const nextIdx = state[cat] + 1;
    const nextSrc = `${APP_CONFIG.PATHS[cat.toUpperCase()]}${nextIdx}${APP_CONFIG.PATHS.EXT}`;
    
    state.cache[cat] = new Image(); // Создаем новый объект, чтобы не перетирать текущий src в DOM
    state.cache[cat].src = nextSrc;
}

/**
 * Механика "Кусь"
 */
function triggerKus() {
    if (isKusActive) return;
    
    isKusActive = true;
    const originalSrc = mainImg.src;
    mainImg.src = APP_CONFIG.PATHS.KUS;
    document.body.classList.add('shake-effect');
    
    setTimeout(() => {
        mainImg.src = originalSrc;
        isKusActive = false;
        document.body.classList.remove('shake-effect');
        nextKusThreshold = clicks + Math.floor(Math.random() * 15) + 5;
    }, APP_CONFIG.UI.KUS_DURATION);
}

/**
 * Создание визуального эффекта лапки
 */
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
    }, APP_CONFIG.UI.PAW_LIFETIME);
}

/**
 * Основной обработчик клика
 */
function handleInteraction(e) {
    if (isKusActive) return;

    clicks++;
    
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (x && y) createPaw(x, y);

    if (clicks >= nextKusThreshold) {
        triggerKus();
    } else {
        nextPhoto();
    }

    updateUI();
    saveGame();
}

function updateUI() {
    clickCountEl.textContent = clicks;
    document.title = `Котямбусы: ${clicks}`;
}

function saveGame() {
    localStorage.setItem('clicks', clicks);
    localStorage.setItem('currentCat', currentCat);
}

// Инициализация событий
document.addEventListener('DOMContentLoaded', () => {
    initPreload();
    updateUI();
    
    mainImg.addEventListener('mousedown', handleInteraction);
    mainImg.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Предотвращаем двойной тап на мобильных
        handleInteraction(e);
    }, { passive: false });
});

// Слушатель смены кота (если есть UI кнопки)
function switchCat(newCat) {
    if (currentCat === newCat) return;
    currentCat = newCat;
    state[newCat] = 1;
    mainImg.src = `${APP_CONFIG.PATHS[newCat.toUpperCase()]}1${APP_CONFIG.PATHS.EXT}`;
    saveGame();
}