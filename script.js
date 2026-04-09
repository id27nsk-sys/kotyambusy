let coins = parseInt(localStorage.getItem('coins')) || 0;
let maxUnlocked = { 'b': 1, 's': 1 };
try {
    const saved = JSON.parse(localStorage.getItem('maxUnlocked'));
    if (saved) maxUnlocked = saved;
} catch(e) { console.error("🐾 Data corrupted"); }

let currentHero = 'b';
let photoIndex = 1;
let totalPhotosDetected = { 'b': 1, 's': 1 };
let isUpdating = false;
let kusCounter = 0;
let nextKusThreshold = Math.floor(Math.random() * (11) + 9);

function preloadArchive(type) {
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    let count = 1;
    function checkNext() {
        let testIdx = count + 1;
        let fmtIdx = testIdx < 10 ? `0${testIdx}` : testIdx;
        let src = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;
        const img = new Image();
        img.onload = () => { count++; totalPhotosDetected[type] = count; updateUI(); checkNext(); };
        img.src = src;
    }
    checkNext();
}

function handleAction(event) {
    coins++;
    updateUI();
    saveData();
    if (event) createPaw(event);

    // KUS_ATTACK_STRICT
    if (currentHero === 'b' && !isUpdating) {
        kusCounter++;
        if (kusCounter >= nextKusThreshold) { triggerKus(); }
    }

    if (coins % 30 === 0 && coins !== 0) { triggerGlow(); }
    if (coins % 5 === 0 && !isUpdating) { tryNextPhoto(); }
    if (coins % 100 === 0 && coins !== 0) { showMilestone(); }
}

function triggerKus() {
    isUpdating = true;
    const heroBox = document.querySelector('.hero-display');
    const catImg = document.getElementById('target-cat');
    const body = document.body;
    const oldSrc = catImg.src;

    // SCREEN_SHAKE_STRICT: Унифицированный эффект для всех ОС
    body.classList.add('shake-effect');
    
    /* 
    // REASON: HAPTIC_ATTACK_STRICT деактивирован для унификации опыта Android/iOS.
    if ("vibrate" in navigator) { navigator.vibrate(); } 
    */

    catImg.src = 'images/cats/actions/KUS.jpg';
    heroBox.classList.add('kus-active');
    kusCounter = 0;
    nextKusThreshold = Math.floor(Math.random() * (11) + 9);

    // IMPACT_DYNAMICS_STRICT: 500ms
    setTimeout(() => {
        catImg.src = oldSrc;
        heroBox.classList.remove('kus-active');
        body.classList.remove('shake-effect');
        isUpdating = false;
    }, 500);
}

function triggerGlow() {
    const hero = document.querySelector('.hero-display');
    if (hero) {
        hero.classList.add('glow-active');
        setTimeout(() => hero.classList.remove('glow-active'), 3000);
    }
}

function tryNextPhoto() {
    isUpdating = true;
    const folder = currentHero === 'b' ? 'basya' : 'savely';
    const prefix = currentHero === 'b' ? 'b' : 's';
    photoIndex = (photoIndex % totalPhotosDetected[currentHero]) + 1;
    if (photoIndex > maxUnlocked[currentHero]) maxUnlocked[currentHero] = photoIndex;
    
    let fmtIdx = photoIndex < 10 ? `0${photoIndex}` : photoIndex;
    const nextImg = new Image();
    nextImg.onload = () => { document.getElementById('target-cat').src = nextImg.src; updateUI(); isUpdating = false; };
    nextImg.src = `images/cats/${folder}/${prefix}${fmtIdx}.jpg`;
}

function selectHero(type) {
    currentHero = type; photoIndex = 1; kusCounter = 0;
    const folder = type === 'b' ? 'basya' : 'savely';
    const prefix = type === 'b' ? 'b' : 's';
    document.getElementById('target-cat').src = `images/cats/${folder}/${prefix}01.jpg`;
    updateUI();
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('photo-stat').innerText = `${maxUnlocked[currentHero]}/${totalPhotosDetected[currentHero]}`;
}

function createPaw(e) {
    if (document.querySelectorAll('.paw-particle').length > 20) return;
    const paw = document.createElement('div');
    paw.className = 'paw-particle'; paw.innerHTML = '🐾';
    const x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    paw.style.left = `${x}px`; paw.style.top = `${y}px`;
    const dX = (Math.random() - 0.5) * 300; const dY = (Math.random() - 0.5) * 300;
    paw.style.setProperty('--x', `${dX}px`); paw.style.setProperty('--y', `${dY}px`);
    paw.style.setProperty('--r', `${Math.random() * 360}deg`);
    document.body.appendChild(paw);
    setTimeout(() => { if (paw.parentNode) paw.remove(); }, 700);
}

function saveData() { localStorage.setItem('coins', coins); localStorage.setItem('maxUnlocked', JSON.stringify(maxUnlocked)); }
function resetAll() { if(confirm("🐾 Сбросить всё?")) { coins = 0; photoIndex = 1; maxUnlocked = { 'b': 1, 's': 1 }; kusCounter = 0; localStorage.clear(); updateUI(); selectHero(currentHero); } }
function showMilestone() { const toast = document.createElement('div'); toast.className = 'milestone-toast'; toast.innerHTML = `🐾 УРОВЕНЬ ПОВЫШЕН: ${coins} ПОГЛАЖИВАНИЙ 🐾`; document.body.appendChild(toast); setTimeout(() => toast.remove(), 2000); }
window.onload = () => { preloadArchive('b'); preloadArchive('s'); updateUI(); };
