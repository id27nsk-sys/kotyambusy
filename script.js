// Конфигурация проекта v3.0
const KOTYAMBUS_CORE = {
    basya: { name: "БАСЯ", mult: 1, bite: 0.2, patience: 5, img: "img/live/basya/1.jpg" },
    saveliy: { name: "САВЕЛИЙ", mult: 2, bite: 0.05, patience: 15, img: "img/live/saveliy/1.jpg" }
};

let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentCat = 'basya';
let currentPatience = KOTYAMBUS_CORE[currentCat].patience;
let isBitten = false;

const coinDisplay = document.getElementById('coins');
const photo = document.getElementById('cat-photo');
const pFill = document.getElementById('patience-fill');

function updateUI() {
    coinDisplay.innerText = coins;
    localStorage.setItem('coins', coins);
    const pPercent = (currentPatience / KOTYAMBUS_CORE[currentCat].patience) * 100;
    pFill.style.width = pPercent + '%';
    pFill.style.background = pPercent < 30 ? '#f44336' : '#4caf50';
}

// Эффект лапок
function createPaw(e) {
    const paw = document.createElement('div');
    paw.innerHTML = '🐾';
    paw.className = 'paw-particle';
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    
    paw.style.setProperty('--tw-x', (Math.random() - 0.5) * 200 + 'px');
    paw.style.setProperty('--tw-y', (Math.random() - 0.5) * 200 + 'px');
    paw.style.setProperty('--tw-r', Math.random() * 360 + 'deg');
    
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 800);
}

photo.addEventListener('click', (e) => {
    if (isBitten) return;
    
    createPaw(e);
    
    // Логика клика
    currentPatience--;
    coins += KOTYAMBUS_CORE[currentCat].mult;

    // Проверка на КУСЬ
    if (currentPatience <= 0) {
        if (Math.random() < KOTYAMBUS_CORE[currentCat].bite) {
            triggerBite();
        } else {
            currentPatience = KOTYAMBUS_CORE[currentCat].patience;
        }
    }
    updateUI();
});

function triggerBite() {
    isBitten = true;
    coins = Math.max(0, coins - 10);
    document.getElementById('bite-overlay').style.display = 'block';
    setTimeout(() => {
        isBitten = false;
        document.getElementById('bite-overlay').style.display = 'none';
        currentPatience = KOTYAMBUS_CORE[currentCat].patience;
        updateUI();
    }, 2000);
}

function switchCat(id) {
    currentCat = id;
    currentPatience = KOTYAMBUS_CORE[id].patience;
    photo.src = KOTYAMBUS_CORE[id].img;
    document.getElementById('cat-name').innerText = KOTYAMBUS_CORE[id].name;
    updateUI();
}

function resetGame() {
    localStorage.clear();
    location.reload();
}

updateUI();
