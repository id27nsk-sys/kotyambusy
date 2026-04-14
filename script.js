// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let coins = parseInt(localStorage.getItem('coins')) || 0;
let coinsB = parseInt(localStorage.getItem('coins_b')) || 0;
let coinsS = parseInt(localStorage.getItem('coins_s')) || 0;
let maxUnlocked = { 'b': 1, 's': 1 };

try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { console.error("🐾 Data corrupted"); }

let currentHero = 'b';
let heroIndices = { 'b': 1, 's': 1 };
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;
let photoTimeout = null;               // 🆕 для отмены смены фото

// Логика Куся для Баси
let lastTapTime = Date.now();
let isKusActive = false;
let fastThreshold = 150;
let slowThreshold = 3000;

// Мастерская
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

// ========== СМЕНА ФОТО В ЦИКЛЕ (исправлено) ==========
function tryNextPhoto() {
    if (isKusActive) return;                      // 🆕 защита от Куся
    if (totalPhotosDetected[currentHero] <= 1) return;
    
    if (photoTimeout) clearTimeout(photoTimeout); // 🆕 отмена предыдущего
    
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
            updateUI();
            isUpdating = false;
            photoTimeout = null;
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

// ========== КУСЬ! (исправлено) ==========
function triggerKus(reason = 'random') {
    if (isKusActive) return;
    
    // 🆕 отменяем запланированную смену фото
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
        lastTapTime = Date.now();
    }, 500);
}

// ========== ПЕРЕКЛЮЧЕНИЕ ГЕРОЯ (исправлено) ==========
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
            updateUI();
            const heroBox = document.querySelector('.hero-display');
            if (heroBox) {
                heroBox.style.borderColor = '';
                heroBox.style.boxShadow = '';
            }
        };
    }, 300);
}

// ========== ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений) ==========
function updateUI() {
    const statLine = document.getElementById('stat-line');
    if (statLine) {
        statLine.innerText = `🐾 ${coins} | Фото: ${maxUnlocked[currentHero]}/${totalPhotosDetected[currentHero]}`;
    }
    document.title = `${coins} | 🐾КОТЯМБУСЫ🐾`;
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
        
        localStorage.clear();
        
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
    document.getElementById('admin-pass').focus();
}

function closeModals(e) {
    if (e.target.className === 'modal-overlay') e.target.style.display = 'none';
}

function checkPass(val) {
    if (val === SECRET_CODE) {
        document.getElementById('auth-modal').style.display = 'none';
        document.getElementById('admin-pass').value = '';
        document.getElementById('workshop-modal').style.display = 'flex';
        updateWorkshopButtons();
    }
}

function updateWorkshopButtons() {
    document.getElementById('btn-b').innerText = `БАСЯ (${getFileName('b')})`;
    document.getElementById('btn-s').innerText = `САВЕЛИЙ (${getFileName('s')})`;
}

function getFileName(type) {
    const next = (totalPhotosDetected[type] || 0) + 1;
    const padded = next < 10 ? `0${next}` : next;
    return `${type}${padded}.webp`;
}

function handleFile(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        workshopImg = new Image();
        workshopImg.onload = () => {
            const side = Math.min(workshopImg.width, workshopImg.height);
            imgScale = 800 / side;
            imgX = 0;
            imgY = 0;
            document.getElementById('zoom-slider').value = imgScale;
            drawCanvas();
            document.getElementById('filename-preview').innerText = "Фото загружено. Двигай и зумируй!";
        };
        workshopImg.src = event.target.result;
    };
    if (e.target.files) reader.readAsDataURL(e.target.files[0]);
}

function drawCanvas() {
    if (!workshopImg) return;
    const canvas = document.getElementById('crop-canvas');
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
    const getPos = (e) => e.touches ? e.touches[0] : e;
    
    const start = (e) => {
        isDragging = true;
        const p = getPos(e);
        startX = p.clientX - imgX;
        startY = p.clientY - imgY;
    };
    
    const move = (e) => {
        if (!isDragging || !workshopImg) return;
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
    if (!workshopImg) return alert("🐾 Выбери фото!");
    document.getElementById('crop-canvas').toBlob((blob) => {
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
    if (document.querySelectorAll('.paw-particle').length > 20) return;
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = '🐾';
    const p = e.touches ? e.touches[0] : e;
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
    preloadArchive('b');
    preloadArchive('s');
    updateUI();
    initWorkshopControls();
};