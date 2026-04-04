// === 1. ИНИЦИАЛИЗАЦИЯ ===
let coins = parseInt(localStorage.getItem('coins')) || 0;
let catStats = JSON.parse(localStorage.getItem('catStats')) || { basya: 0, savely: 0, custom: 0 };
let currentCat = 'basya';

const catImages = {
    basya: 'images/cats/basya/b01.jpg',
    savely: 'images/cats/savely/s01.jpg'
};

const catImage = document.getElementById('catImage');
const fileInput = document.getElementById('file-input');
const notification = document.getElementById('notification');

// === 2. РАНДОМНЫЙ ФОН ===
function setRandomGradient() {
    const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 65%, 85%)`;
    document.documentElement.style.setProperty('--grad-1', randomColor());
    document.documentElement.style.setProperty('--grad-2', randomColor());
}

// === 3. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ===
function updateUI() {
    document.getElementById('coins').innerText = coins;
    const clicks = catStats[currentCat] || 0;
    const catName = currentCat === 'basya' ? 'Бася' : currentCat === 'savely' ? 'Савелий' : 'Свой котик';
    document.getElementById('counter').innerText = `${catName}: ${clicks}`;
    document.getElementById('progress-fill').style.width = (clicks % 100) + '%';
    
    updateRank(clicks);
    localStorage.setItem('coins', coins);
    localStorage.setItem('catStats', JSON.stringify(catStats));
}

function updateRank(clicks) {
    let rank = "Новичок", icon = "☁️";
    if (clicks >= 100) { rank = "Любитель"; icon = "🌟"; }
    if (clicks >= 200) { rank = "Мастер"; icon = "🔥"; }
    if (clicks >= 300) { rank = "Легенда"; icon = "👑"; }
    if (clicks >= 500) { 
        rank = "БОГ КОТОВ"; icon = "✨"; 
        catImage.classList.add('golden-mode');
    } else {
        catImage.classList.remove('golden-mode');
    }
    document.getElementById('rank-text').innerText = rank;
    document.getElementById('rank-icon').innerText = icon;
}

function showNotification(text) {
    notification.innerText = text;
    notification.classList.remove('hidden');
    clearTimeout(window.notifTimeout);
    window.notifTimeout = setTimeout(() => notification.classList.add('hidden'), 2000);
}

// === 4. ЭФФЕКТЫ (Оптимизировано для Mobile) ===
function createPaw(e) {
    // Ограничение по количеству лапок на экране для защиты от тормозов
    if (document.querySelectorAll('.paw-particle').length > 15) return;

    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = `<img src="images/favicon.png" style="width:35px; height:35px; pointer-events:none;">`;
    
    const x = e.clientX || (e.touches && e.touches[0].clientX) || (e.changedTouches && e.changedTouches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY) || (e.changedTouches && e.changedTouches[0].clientY);
    
    paw.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
    paw.style.setProperty('--ty', (Math.random() * -150 - 50) + 'px');
    paw.style.setProperty('--tr', (Math.random() * 360) + 'deg');
    
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 850);
}

// === 5. ОБРАБОТЧИКИ ===

// Поддержка быстрых нажатий на мобилках
catImage.parentElement.addEventListener('pointerdown', (e) => {
    // Убираем лишние эффекты браузера при касании
    if (e.pointerType === 'touch') e.preventDefault();
    
    coins++;
    catStats[currentCat]++;
    createPaw(e);
    updateUI();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetCat = btn.dataset.cat;
        
        if (targetCat === 'custom') {
            fileInput.click();
        } else {
            document.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentCat = targetCat;
            catImage.src = catImages[currentCat];
            setRandomGradient();
            updateUI();
        }
    });
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            catImage.src = event.target.result;
            
            document.querySelector('.tab-btn.active').classList.remove('active');
            document.getElementById('custom-tab-btn').classList.add('active');
            
            currentCat = 'custom';
            setRandomGradient();
            updateUI();
            showNotification("Котик загружен! 🐾");
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-toggle').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

document.getElementById('resetButton').addEventListener('click', () => {
    if(confirm("Сбросить всё?")) {
        localStorage.clear();
        location.reload();
    }
});

window.addEventListener('load', () => {
    setRandomGradient();
    updateUI();
});
