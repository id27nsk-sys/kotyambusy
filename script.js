// === ИНИЦИАЛИЗАЦИЯ ===
let coins = parseInt(localStorage.getItem('coins')) || 0;
let catStats = JSON.parse(localStorage.getItem('catStats')) || { basya: 0, savely: 0, custom: 0 };
let currentCat = 'basya';

const catImages = {
    basya: 'images/cats/basya/b01.jpg',
    savely: 'images/cats/savely/s01.jpg'
};

// === ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ===
function updateUI() {
    document.getElementById('coins').innerText = coins;
    const clicks = catStats[currentCat];
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
        document.getElementById('catImage').classList.add('golden-mode');
    }
    document.getElementById('rank-text').innerText = rank;
    document.getElementById('rank-icon').innerText = icon;
}

// === ЭФФЕКТЫ ===
function createPaw(e) {
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    paw.innerHTML = `<img src="images/favicon.png" style="width:35px; height:35px;">`;
    
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    paw.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
    paw.style.setProperty('--ty', (Math.random() * -150 - 50) + 'px');
    paw.style.setProperty('--tr', (Math.random() * 360) + 'deg');
    
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 800);
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===
document.getElementById('catImage').parentElement.addEventListener('pointerdown', (e) => {
    coins++;
    catStats[currentCat]++;
    createPaw(e);
    updateUI();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tab-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        if (currentCat !== 'custom') {
            document.getElementById('catImage').src = catImages[currentCat];
        }
        updateUI();
    });
});

document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-toggle').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

document.getElementById('resetButton').addEventListener('click', () => {
    if(confirm("Сбросить весь прогресс?")) {
        localStorage.clear();
        location.reload();
    }
});

window.addEventListener('DOMContentLoaded', updateUI);
