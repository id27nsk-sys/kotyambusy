// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========

// Функция безопасного преобразования в число
function sanitizeNumber(value, defaultValue = 0) {
    const num = Number(value);
    return isNaN(num) ? defaultValue : Math.max(0, Math.floor(num));
}

// Функция безопасного чтения из localStorage
function loadFromStorage() {
    let coins = sanitizeNumber(localStorage.getItem('coins'));
    let coinsB = sanitizeNumber(localStorage.getItem('coins_b'));
    let coinsS = sanitizeNumber(localStorage.getItem('coins_s'));
    let maxUnlocked = { 'b': 1, 's': 1 };

    try {
        const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
        if (saved && typeof saved === 'object' && saved !== null) {
            maxUnlocked = {
                'b': sanitizeNumber(saved.b, 1),
                's': sanitizeNumber(saved.s, 1)
            };
            // Ограничиваем разумным максимумом
            if (maxUnlocked.b > 100) maxUnlocked.b = 100;
            if (maxUnlocked.s > 100) maxUnlocked.s = 100;
        }
    } catch(e) {
        console.error("🐾 Данные повреждены, использую значения по умолчанию");
    }
    
    return { coins, coinsB, coinsS, maxUnlocked };
}

// Инициализация переменных
let loadResult = loadFromStorage();
let coins = loadResult.coins;
let coinsB = loadResult.coinsB;
let coinsS = loadResult.coinsS;
let maxUnlocked = loadResult.maxUnlocked;

let currentHero = 'b';
let heroIndices = { 'b': 1, 's': 1 };
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;
let photoTimeout = null;

// Логика Куся для Баси
let lastTapTime = Date.now();
let isKusActive = false;
let fastThreshold = 150;
let slowThreshold = 3000;

// Мастерская (не меняем)
const SECRET_CODE = "BS_0704!";
let workshopImg = null;
let imgX = 0, imgY = 0, imgScale = 1;
let isDragging = false;
let startX, startY;

// ========== ФУНКЦИЯ ОБНОВЛЕНИЯ ЦВЕТА РАМКИ ==========
function updateBorderColor(interval) {
    const heroBox = document.querySelector('.hero-display');
    if (!heroBox) return;
    
    if (isKusActive || currentHero !== 'b') {
        heroBox.style.borderColor = '';
        heroBox.style.boxShadow = '';
        return;
    }
    
    let borderColor, boxShadow;
    
    if (interval < fastThreshold) {
        borderColor = '#ff4444';
        boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
    } else if (interval < 500) {
        borderColor = '#ffaa44';
        boxShadow = '0 0 15px rgba(255, 170, 68, 0.3)';
    } else if (interval <= 2000) {
        borderColor = '#44ff44';
        boxShadow = '0 0 10px rgba(68, 255, 68, 0.2)';
    } else if (interval < slowThreshold) {
        borderColor = '#ffaa44';
        boxShadow = '0 0 15px rgba(255, 170, 68, 0.3)';
    } else {
        borderColor = '#ff4444';
        boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
    }
    
    heroBox.style.borderColor = borderColor;
    heroBox.style.boxShadow = boxShadow;
}

// ========== ПРЕДЗАГРУЗКА АРХИВА ==========
function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    let count = 1;
    
    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        const img = new Image();
        img.onload = () => {
            count++;
            totalPhotosDetected[type] = count;
            updateUI();
            checkNext();
        };
        img.onerror = () => {
            totalPhotosDetected[type] = count;
            updateUI();
        };
        img.src = src;
    }
    checkNext();
}

// ========== ОСНОВНОЕ ДЕЙСТВИЕ (ПОГЛАЖИВАНИЕ) ==========
function handleAction(event) {
    if (isKusActive) return;
    
    const now = Date.now();
    const interval = now - lastTapTime;
    
    // Защита от спама (клики чаще 50 мс игнорируем)
    if (interval < 50) return;
    
    if (lastTapTime !== now && currentHero === 'b') {
        if (interval < fastThreshold) {
            triggerKus('fast');
            return;
        }
        if (interval > slowThreshold) {
            triggerKus('slow');
            return;
        }
    }
    
    // Нормальное поглаживание
    coins++;
    if (currentHero === 'b') coinsB++; else coinsS++;
    updateUI();
    saveData();
    if (event) createPaw(event);
    
    lastTapTime = now;
    
    if (coins % 30 === 0 && coins !== 0) triggerGlow();
    if (coins % 5 === 0 && !isUpdating && !isKusActive) tryNextPhoto();
    if (coins % 100 === 0 && coins !== 0) showMilestone();
    
    updateBorderColor(0);
}

// ========== СМЕНА ФОТО В ЦИКЛЕ (с Fade-in) ==========
function tryNextPhoto() {
    if (isKusActive) return;
    if (totalPhotosDetected[currentHero] <= 1) return;
    
    if (photoTimeout) clearTimeout(photoTimeout);
    isUpdating = true;
    const catImg = document.getElementById('target-cat');
    catImg.classList.add('fade-out');
    
    const oldIndex = heroIndices[currentHero];
    const newIndex = (oldIndex % totalPhotosDetected[currentHero]) + 1;
    
    photoTimeout = setTimeout(() => {
        const folder = currentHero === 'b' ? 'basya' : 'savely';
        const prefix = currentHero === 'b' ? 'b' : 's';
        const fmtIdx = newIndex < 10 ? `0${newIndex}` : newIndex;
        const imgSrc = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        
        const nextImg = new Image();
        nextImg.onload = () => {
            heroIndices[currentHero] = newIndex;
            if (heroIndices[currentHero] > maxUnlocked[currentHero]) {
                maxUnlocked[currentHero] = heroIndices[currentHero];
            }
            
            catImg.src = imgSrc;
            catImg.classList.remove('fade-out');
            catImg.classList.add('fade-in');
            
            setTimeout(() => {
                catImg.classList.remove('fade-in');
                updateUI();
                isUpdating = false;
                photoTimeout = null;
            }, 300);
        };
        nextImg.onerror = () => {
            console.warn(`🐾 Фото не загружено: ${imgSrc}`);
            catImg.classList.remove('fade-out');
            isUpdating = false;
            photoTimeout = null;
        };
        nextImg.src = imgSrc;
    }, 300);
}

// ========== КУСЬ! ==========
function triggerKus(reason = 'random') {
    if (isKusActive) return;
    
    if (photoTimeout) {
        clearTimeout(photoTimeout);
        photoTimeout = null;
        isUpdating = false;
    }
    
    isKusActive = true;
    isUpdating = true;
    
    const heroBox = document.querySelector('.hero-display');
    const catImg = document.getElementById('target-cat');
    const body = document.body;
    const oldSrc = catImg.src;
    
    body.classList.add('shake-effect');
    catImg.src = 'images/cats/actions/KUS.webp';
    heroBox.classList.add('kus-active');
    
    let message = '';
    if (reason === 'fast') message = '🐾 БАСЯ КУСАЕТСЯ! Не тыкай так быстро! 🐾';
    else if (reason === 'slow') message = '🐾 БАСЯ КУСАЕТСЯ! Ты забыл про меня? 🐾';
    else message = '🐾 БАСЯ КУСАЕТСЯ! 🐾';
    showToast(message);
    
    setTimeout(() => {
        catImg.src = oldSrc;
        heroBox.classList.remove('kus-active');
        body.classList.remove('shake-effect');
        
        isUpdating = false;
        isKusActive = false;
        
        heroBox.style.borderColor = '';
        heroBox.style.boxShadow = '';
        
        // Полный сброс таймера
        lastTapTime = Date.now();
        
        updateUI();
    }, 500);
}

// ========== ПЕРЕКЛЮЧЕНИЕ ГЕРОЯ ==========
function selectHero(type) {
    if (isUpdating || isKusActive) return;
    
    if (photoTimeout) {
        clearTimeout(photoTimeout);
        photoTimeout = null;
        isUpdating = false;
    }
    
    const catImg = document.getElementById('target-cat');
    catImg.classList.add('fade-out');
    
    setTimeout(() => {
        currentHero = type;
        lastTapTime = Date.now();
        
        const folder = type === 'b' ? 'basya' : 'savely';
        const prefix = type === 'b' ? 'b' : 's';
        let fmtIdx = heroIndices[currentHero] < 10 ? `0${heroIndices[currentHero]}` : heroIndices[currentHero];
        catImg.src = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        
        catImg.onload = () => {
            catImg.classList.remove('fade-out');
            catImg.classList.add('fade-in');
            
            setTimeout(() => {
                catImg.classList.remove('fade-in');
                updateUI();
                const heroBox = document.querySelector('.hero-display');
                if (heroBox) {
                    heroBox.style.borderColor = '';
                    heroBox.style.boxShadow = '';
                }
            }, 300);
        };
    }, 300);
}

// ========== ОСТАЛЬНЫЕ ФУНКЦИИ ==========
function updateUI() {
    const statLine = document.getElementById('stat-line');
    if (statLine) {
        statLine.innerText = `🐾 ${coins} | Фото: ${maxUnlocked[currentHero]}/${totalPhotosDetected[currentHero]}`;
    }
    // Безопасная установка title
    const safeCoins = String(coins).replace(/[^\d]/g, '');
    document.title = `${safeCoins} | 🐾КОТЯМБУСЫ🐾`;
}

function saveData() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('coins_b', coinsB);
    localStorage.setItem('coins_s', coinsS);
    localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked));
}

function resetAll() {
    if (confirm("🐾 Сбросить всё?")) {
        coins = 0;
        coinsB = 0;
        coinsS = 0;
        heroIndices = { 'b': 1, 's': 1 };
        maxUnlocked = { 'b': 1, 's': 1 };
        
        // Удаляем ТОЛЬКО ключи приложения
        localStorage.removeItem('coins');
        localStorage.removeItem('coins_b');
        localStorage.removeItem('coins_s');
        localStorage.removeItem('maxUnlocked');
        
        totalPhotosDetected = { 'b': 1, 's': 1 };
        preloadArchive('b');
        preloadArchive('s');
        
        lastTapTime = Date.now();
        isKusActive = false;
        
        if (photoTimeout) {
            clearTimeout(photoTimeout);
            photoTimeout = null;
        }
        isUpdating = false;
        
        updateUI();
        selectHero(currentHero);
    }
}

function openAuth() {
    document.getElementById('auth-modal').style.display = 'flex';
    const passInput = document.getElementById('admin-pass');
    if (passInput) passInput.focus();
}

function closeModals(e) {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
}

function checkPass(val) {
    if (val === SECRET_CODE) {
        document.getElementById('auth-modal').style.display = 'none';
        const passInput = document.getElementById('admin-pass');
        if (passInput) passInput.value = '';
        document.getElementById('workshop-modal').style.display = 'flex';
        updateWorkshopButtons();
    }
}

function updateWorkshopButtons() {
    const btnB = document.getElementById('btn-b');
    const btnS = document.getElementById('btn-s');
    if (btnB) btnB.innerText = `БАСЯ (${getFileName('b')})`;
    if (btnS) btnS.innerText = `САВЕЛИЙ (${getFileName('s')})`;
}

function getFileName(type) {
    const detected = totalPhotosDetected[type];
    const next = (detected !== undefined && detected !== null) ? detected + 1 : 1;
    const padded = next < 10 ? `0${next}` : next;
    return `${type}${padded}.webp`;
}

function handleFile(e) {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        workshopImg = new Image();
        workshopImg.onload = () => {
            const side = Math.min(workshopImg.width, workshopImg.height);
            imgScale = 800 / side;
            imgX = 0;
            imgY = 0;
            const zoomSlider = document.getElementById('zoom-slider');
            if (zoomSlider) zoomSlider.value = imgScale;
            drawCanvas();
            const preview = document.getElementById('filename-preview');
            if (preview) preview.innerText = "Фото загружено. Двигай и зумируй!";
        };
        workshopImg.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

function drawCanvas() {
    if (!workshopImg) return;
    const canvas = document.getElementById('crop-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    ctx.save();
    ctx.translate(400 + imgX, 400 + imgY);
    ctx.scale(imgScale, imgScale);
    ctx.drawImage(workshopImg, -workshopImg.width / 2, -workshopImg.height / 2);
    ctx.restore();
}

function handleZoom(val) {
    imgScale = parseFloat(val);
    drawCanvas();
}

function initWorkshopControls() {
    const canvas = document.getElementById('crop-canvas');
    if (!canvas) return;
    
    const getPos = (e) => {
        if (e.touches && e.touches.length > 0) return e.touches[0];
        return e;
    };
    
    const start = (e) => {
        e.preventDefault();
        isDragging = true;
        const p = getPos(e);
        startX = p.clientX - imgX;
        startY = p.clientY - imgY;
    };
    
    const move = (e) => {
        if (!isDragging || !workshopImg) return;
        e.preventDefault();
        const p = getPos(e);
        imgX = p.clientX - startX;
        imgY = p.clientY - startY;
        drawCanvas();
    };
    
    const stop = () => isDragging = false;
    
    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', stop);
}

function exportPhoto(type) {
    if (!workshopImg) {
        alert("🐾 Выбери фото!");
        return;
    }
    const canvas = document.getElementById('crop-canvas');
    if (!canvas) return;
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = getFileName(type);
        link.href = URL.createObjectURL(blob);
        link.click();
        if (confirm("🐾 Фото " + link.download + " готово. Закрыть мастерскую?")) {
            document.getElementById('workshop-modal').style.display = 'none';
        }
    }, 'image/webp', 0.8);
}

function createPaw(e) {
    if (!e) return;
    if (document.querySelectorAll('.paw-particle').length > 20) return;
    
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = '🐾';
    
    // Безопасное получение координат
    let p = e;
    if (e.touches && e.touches.length > 0) {
        p = e.touches[0];
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        p = e.changedTouches[0];
    }
    
    if (!p || p.clientX === undefined) return;
    
    paw.style.left = `${p.clientX}px`;
    paw.style.top = `${p.clientY}px`;
    const dX = (Math.random() - 0.5) * 300;
    const dY = (Math.random() - 0.5) * 300;
    paw.style.setProperty('--x', `${dX}px`);
    paw.style.setProperty('--y', `${dY}px`);
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 700);
}

function triggerGlow() {
    const h = document.querySelector('.hero-display');
    if (h) {
        h.classList.add('glow-active');
        setTimeout(() => h.classList.remove('glow-active'), 3000);
    }
}

function showMilestone() {
    const t = document.createElement('div');
    t.className = 'milestone-toast';
    t.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// ========== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ==========
function bindEventHandlers() {
    // Клик по кругу
    const heroDisplay = document.getElementById('hero-display');
    if (heroDisplay) {
        heroDisplay.addEventListener('click', handleAction);
    }
    
    // Кнопки выбора героя
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const hero = btn.getAttribute('data-hero');
            if (hero === 'b' || hero === 's') selectHero(hero);
        });
    });
    
    // Кнопка ФОТО
    const photosBtn = document.getElementById('btn-show-photos');
    if (photosBtn) {
        photosBtn.addEventListener('click', () => {
            showToast("🐾 Фотоальбом в разработке");
        });
    }
    
    // Кнопка СБРОС
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetAll);
    
    // Триггер мастерской
    const adminTrigger = document.getElementById('admin-trigger');
    if (adminTrigger) adminTrigger.addEventListener('click', openAuth);
    
    // Закрытие модалок
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeModals);
    });
    
    // Поле пароля
    const adminPass = document.getElementById('admin-pass');
    if (adminPass) {
        adminPass.addEventListener('input', (e) => checkPass(e.target.value));
    }
    
    // Загрузка файла
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFile);
    }
    
    // Зум слайдер
    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => handleZoom(e.target.value));
    }
    
    // Кнопки экспорта
    const exportB = document.getElementById('btn-b');
    const exportS = document.getElementById('btn-s');
    if (exportB) exportB.addEventListener('click', () => exportPhoto('b'));
    if (exportS) exportS.addEventListener('click', () => exportPhoto('s'));
}

// ========== ПЕРИОДИЧЕСКОЕ ОБНОВЛЕНИЕ ЦВЕТА РАМКИ ==========
setInterval(() => {
    if (currentHero === 'b' && !isKusActive) {
        const now = Date.now();
        const interval = now - lastTapTime;
        updateBorderColor(interval);
    }
}, 100);

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
window.onload = () => {
    bindEventHandlers();
    preloadArchive('b');
    preloadArchive('s');
    updateUI();
    initWorkshopControls();
};