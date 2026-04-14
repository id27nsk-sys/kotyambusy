let coins = parseInt(localStorage.getItem('coins')) || 0;
let coinsB = parseInt(localStorage.getItem('coins_b')) || 0;
let coinsS = parseInt(localStorage.getItem('coins_s')) || 0;
let maxUnlocked = { 'b': 1, 's': 1 };
try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { console.error("🐾 Data corrupted"); }

let currentHero = 'b', heroIndices = { 'b': 1, 's': 1 }, totalPhotosDetected = { 'b': 1, 's': 1 }, isUpdating = false, kusCounter = 0;
let nextKusThreshold = Math.floor(Math.random() * 11) + 9;
const SECRET_CODE = "BS_0704!";
let workshopImg = null, imgX = 0, imgY = 0, imgScale = 1, isDragging = false, startX, startY;

// 🆕 Флаг для блокировки кликов во время Куся
let isKusActive = false;

function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely', prefix = type === 'b' ? 'b' : 's';
    let count = 1;
    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        const img = new Image();
        img.onload = () => { count++; totalPhotosDetected[type] = count; updateUI(); checkNext(); };
        img.onerror = () => { totalPhotosDetected[type] = count; updateUI(); };
        img.src = src;
    }
    checkNext();
}

// 🆕 Исправлено: блокировка кликов во время Куся
function handleAction(event) {
    if (isKusActive) return;
    
    coins++;
    if (currentHero === 'b') coinsB++; else coinsS++;
    updateUI(); saveData();
    if (event) createPaw(event);
    if (currentHero === 'b' && !isUpdating) {
        kusCounter++;
        if (kusCounter >= nextKusThreshold) { triggerKus(); return; }
    }
    if (coins % 30 === 0 && coins !== 0) triggerGlow();
    if (coins % 5 === 0 && !isUpdating) tryNextPhoto();
    if (coins % 100 === 0 && coins !== 0) showMilestone();
}

// 🆕 Исправлено: добавлена блокировка isKusActive
function triggerKus() {
    if (isKusActive) return;
    isKusActive = true;
    isUpdating = true;
    
    const heroBox = document.querySelector('.hero-display'), catImg = document.getElementById('target-cat'), body = document.body, oldSrc = catImg.src;
    body.classList.add('shake-effect');
    catImg.src = 'images/cats/actions/KUS.webp';
    heroBox.classList.add('kus-active');
    kusCounter = 0; nextKusThreshold = Math.floor(Math.random() * 11) + 9;
    setTimeout(() => { 
        catImg.src = oldSrc; 
        heroBox.classList.remove('kus-active'); 
        body.classList.remove('shake-effect'); 
        isUpdating = false;
        isKusActive = false;
    }, 500);
}

// 🆕 Исправлено: защита от потери индекса при ошибке загрузки фото
function tryNextPhoto() {
    if (totalPhotosDetected[currentHero] <= 1) return;
    isUpdating = true;
    const catImg = document.getElementById('target-cat');
    catImg.classList.add('fade-out');
    
    const oldIndex = heroIndices[currentHero];
    const newIndex = (oldIndex % totalPhotosDetected[currentHero]) + 1;
    
    setTimeout(() => {
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
        };
        nextImg.onerror = () => {
            console.warn(`🐾 Фото не загружено: ${imgSrc}`);
            catImg.classList.remove('fade-out');
            isUpdating = false;
        };
        nextImg.src = imgSrc;
    }, 300);
}

function selectHero(type) {
    if (isUpdating) return;
    const catImg = document.getElementById('target-cat');
    catImg.classList.add('fade-out');
    setTimeout(() => {
        currentHero = type; kusCounter = 0;
        const folder = type === 'b' ? 'basya' : 'savely', prefix = type === 'b' ? 'b' : 's';
        let fmtIdx = heroIndices[currentHero] < 10 ? `0${heroIndices[currentHero]}` : heroIndices[currentHero];
        catImg.src = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        catImg.onload = () => { catImg.classList.remove('fade-out'); updateUI(); };
    }, 300);
}

function updateUI() {
    const statLine = document.getElementById('stat-line');
    if (statLine) {
        statLine.innerText = `🐾 ${coins} | Фото: ${maxUnlocked[currentHero]}/${totalPhotosDetected[currentHero]}`;
    }
    document.title = `${coins} | 🐾КОТЯМБУСЫ🐾`;
}

function saveData() { localStorage.setItem('coins', coins); localStorage.setItem('coins_b', coinsB); localStorage.setItem('coins_s', coinsS); localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked)); }

// 🆕 Исправлено: переопределение totalPhotosDetected при сбросе
function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0;
        coinsB = 0;
        coinsS = 0;
        heroIndices = {'b':1,'s':1};
        maxUnlocked = {'b':1,'s':1};
        kusCounter = 0;
        localStorage.clear();
        
        totalPhotosDetected = { 'b': 1, 's': 1 };
        preloadArchive('b');
        preloadArchive('s');
        
        updateUI();
        selectHero(currentHero);
    }
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; document.getElementById('admin-pass').focus(); }
function closeModals(e) { if(e.target.className === 'modal-overlay') e.target.style.display = 'none'; }
function checkPass(val) { if (val === SECRET_CODE) { document.getElementById('auth-modal').style.display = 'none'; document.getElementById('admin-pass').value = ''; document.getElementById('workshop-modal').style.display = 'flex'; updateWorkshopButtons(); } }
function updateWorkshopButtons() { document.getElementById('btn-b').innerText = `БАСЯ (${getFileName('b')})`; document.getElementById('btn-s').innerText = `САВЕЛИЙ (${getFileName('s')})`; }

// 🆕 Исправлено: защита от undefined totalPhotosDetected
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
            imgScale = 800 / side; imgX = 0; imgY = 0;
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
    const canvas = document.getElementById('crop-canvas'), ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800); ctx.save();
    ctx.translate(400 + imgX, 400 + imgY); ctx.scale(imgScale, imgScale);
    ctx.drawImage(workshopImg, -workshopImg.width / 2, -workshopImg.height / 2); ctx.restore();
}

function handleZoom(val) { imgScale = parseFloat(val); drawCanvas(); }

function initWorkshopControls() {
    const canvas = document.getElementById('crop-canvas');
    const getPos = (e) => e.touches ? e.touches[0] : e;
    const start = (e) => { isDragging = true; const p = getPos(e); startX = p.clientX - imgX; startY = p.clientY - imgY; };
    const move = (e) => { if (!isDragging || !workshopImg) return; const p = getPos(e); imgX = p.clientX - startX; imgY = p.clientY - startY; drawCanvas(); };
    const stop = () => isDragging = false;
    canvas.addEventListener('mousedown', start); window.addEventListener('mousemove', move); window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start); window.addEventListener('touchmove', move); window.addEventListener('touchend', stop);
}

function exportPhoto(type) {
    if (!workshopImg) return alert("🐾 Выбери фото!");
    document.getElementById('crop-canvas').toBlob((blob) => {
        const link = document.createElement('a'); link.download = getFileName(type);
        link.href = URL.createObjectURL(blob); link.click();
        if(confirm("🐾 Фото " + link.download + " готово. Закрыть мастерскую?")) document.getElementById('workshop-modal').style.display = 'none';
    }, 'image/webp', 0.8);
}

function createPaw(e) {
    if (document.querySelectorAll('.paw-particle').length > 20) return;
    const paw = document.createElement('div'); paw.className = 'paw-particle'; paw.innerHTML = '🐾';
    const p = e.touches ? e.touches[0] : e;
    paw.style.left = `${p.clientX}px`; paw.style.top = `${p.clientY}px`;
    const dX = (Math.random() - 0.5) * 300, dY = (Math.random() - 0.5) * 300, r = Math.random() * 360;
    paw.style.setProperty('--x', `${dX}px`); paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${r}deg`);
    document.body.appendChild(paw); setTimeout(() => paw.remove(), 700);
}

function triggerGlow() { const h = document.querySelector('.hero-display'); if(h){ h.classList.add('glow-active'); setTimeout(()=>h.classList.remove('glow-active'), 3000); } }
function showMilestone() { const t = document.createElement('div'); t.className = 'milestone-toast'; t.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`; document.body.appendChild(t); setTimeout(()=>t.remove(), 2000); }

window.onload = () => { preloadArchive('b'); preloadArchive('s'); updateUI(); initWorkshopControls(); };