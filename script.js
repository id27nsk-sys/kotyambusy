let coins = parseInt(localStorage.getItem('coins')) || 0;
// REASON: Сохраняем раздельное хранение в фоне, но UI делаем Zen
let coinsB = parseInt(localStorage.getItem('coins_b')) || 0;
let coinsS = parseInt(localStorage.getItem('coins_s')) || 0;

let maxUnlocked = { 'b': 1, 's': 1 };
try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { console.error("🐾 Data corrupted"); }

let currentHero = 'b', photoIndex = 1, isUpdating = false, kusCounter = 0;
let totalPhotosDetected = { 'b': 1, 's': 1 };
let nextKusThreshold = Math.floor(Math.random() * 11) + 9;
const SECRET_CODE = "BS_0704!";
let workshopImg = null, imgX = 0, imgY = 0, imgScale = 1, isDragging = false, startX, startY;

function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely', prefix = type === 'b' ? 'b' : 's';
    let count = 1;
    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.webp`;
        const img = new Image();
        img.onload = () => { count++; totalPhotosDetected[type] = count; updateUI(); checkNext(); };
        img.src = src;
    }
    checkNext();
}

function handleAction(event) {
    coins++;
    if (currentHero === 'b') coinsB++; else coinsS++;
    updateUI(); saveData();
    if (event) createPaw(event);
    if (currentHero === 'b' && !isUpdating) {
        kusCounter++;
        if (kusCounter >= nextKusThreshold) triggerKus();
    }
    if (coins % 30 === 0 && coins !== 0) triggerGlow();
    if (coins % 5 === 0 && !isUpdating) tryNextPhoto();
    if (coins % 100 === 0 && coins !== 0) showMilestone();
}

// REASON: ZEN_DASHBOARD_STRICT - Статистика в одну строку
function updateUI() {
    const statLine = document.getElementById('stat-line');
    if (statLine) {
        statLine.innerText = `🐾 ${coins} | Фото: ${maxUnlocked[currentHero]}/${totalPhotosDetected[currentHero]}`;
    }
    document.title = `🐾 ${coins} | КОТЯМБУСЫ`;
}

function selectHero(type) {
    if (isUpdating) return;
    const catImg = document.getElementById('target-cat');
    catImg.classList.add('fade-out');
    setTimeout(() => {
        currentHero = type; photoIndex = 1; kusCounter = 0;
        const folder = type === 'b' ? 'basya' : 'savely', prefix = type === 'b' ? 'b' : 's';
        catImg.src = `images/cats/${folder}/${prefix}01.webp`;
        catImg.onload = () => { catImg.classList.remove('fade-out'); updateUI(); };
    }, 300);
}

function saveData() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('coins_b', coinsB);
    localStorage.setItem('coins_s', coinsS);
    localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked));
}

function resetAll() {
    if(confirm("🐾 Сбросить всё?")) {
        coins = 0; coinsB = 0; coinsS = 0; photoIndex = 1; 
        maxUnlocked = {'b':1,'s':1}; kusCounter = 0;
        localStorage.clear(); updateUI(); selectHero(currentHero);
    }
}

// ... WORKSHOP & PARTICLES (Без изменений v4.4) ...
function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; document.getElementById('admin-pass').focus(); }
function closeModals(e) { if(e.target.className === 'modal-overlay') e.target.style.display = 'none'; }
function checkPass(val) { if (val === SECRET_CODE) { document.getElementById('auth-modal').style.display = 'none'; document.getElementById('admin-pass').value = ''; document.getElementById('workshop-modal').style.display = 'flex'; updateWorkshopButtons(); } }
function updateWorkshopButtons() { document.getElementById('btn-b').innerText = `БАСЯ (${getFileName('b')})`; document.getElementById('btn-s').innerText = `САВЕЛИЙ (${getFileName('s')})`; }
function getFileName(type) { const next = totalPhotosDetected[type] + 1; return `${type}${next < 10 ? '0'+next : next}.webp`; }

function handleFile(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        workshopImg = new Image();
        workshopImg.onload = () => {
            const side = Math.min(workshopImg.width, workshopImg.height);
            imgScale = 800 / side; imgX = 0; imgY = 0;
            document.getElementById('zoom-slider').value = imgScale;
            drawCanvas();
            document.getElementById('filename-preview').innerText = "Двигай и масштабируй фото!";
        };
        workshopImg.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files);
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
    const start = (e) => { isDragging = true; const p = e.touches ? e.touches[0] : e; startX = p.clientX - imgX; startY = p.clientY - imgY; };
    const move = (e) => { if (!isDragging || !workshopImg) return; const p = e.touches ? e.touches[0] : e; imgX = p.clientX - startX; imgY = p.clientY - startY; drawCanvas(); };
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
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    paw.style.left = `${x}px`; paw.style.top = `${y}px`;
    const dX = (Math.random() - 0.5) * 300, dY = (Math.random() - 0.5) * 300, r = Math.random() * 360;
    paw.style.setProperty('--x', `${dX}px`); paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${r}deg`);
    document.body.appendChild(paw); setTimeout(() => paw.remove(), 700);
}

function triggerKus() {
    isUpdating = true;
    const heroBox = document.querySelector('.hero-display'), catImg = document.getElementById('target-cat'), body = document.body, oldSrc = catImg.src;
    body.classList.add('shake-effect');
    catImg.src = 'images/cats/actions/KUS.webp';
    heroBox.classList.add('kus-active');
    kusCounter = 0; nextKusThreshold = Math.floor(Math.random() * 11) + 9;
    setTimeout(() => { catImg.src = oldSrc; heroBox.classList.remove('kus-active'); body.classList.remove('shake-effect'); isUpdating = false; }, 500);
}

function triggerGlow() { const h = document.querySelector('.hero-display'); if(h){ h.classList.add('glow-active'); setTimeout(()=>h.classList.remove('glow-active'), 3000); } }
function showMilestone() { const t = document.createElement('div'); t.className = 'milestone-toast'; t.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`; document.body.appendChild(t); setTimeout(()=>t.remove(), 2000); }

window.onload = () => { preloadArchive('b'); preloadArchive('s'); updateUI(); initWorkshopControls(); };
