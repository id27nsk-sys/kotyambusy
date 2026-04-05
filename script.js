const KOTYAMBUS_CORE = {
    basya: { name: "БАСЯ", mult: 1, bite: 0.3, patience: 5, img: "images/cats/basya/b01.jpg" },
    saveliy: { name: "САВЕЛИЙ", mult: 2, bite: 0.1, patience: 15, img: "images/cats/savely/s01.jpg" }
};

let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentCat = 'basya';
let currentPatience = KOTYAMBUS_CORE[currentCat].patience;
let isBitten = false;

function updateUI() {
    document.getElementById('coins').innerText = coins;
    localStorage.setItem('coins', coins);
    const pPercent = (currentPatience / KOTYAMBUS_CORE[currentCat].patience) * 100;
    document.getElementById('patience-fill').style.width = pPercent + '%';
}

function createPaw(e) {
    const paw = document.createElement('div');
    paw.innerHTML = '🐾';
    paw.className = 'paw-particle';
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    paw.style.left = x + 'px';
    paw.style.top = y + 'px';
    paw.style.setProperty('--tw-x', (Math.random() - 0.5) * 250 + 'px');
    paw.style.setProperty('--tw-y', (Math.random() - 0.5) * 250 + 'px');
    paw.style.setProperty('--tw-r', Math.random() * 360 + 'deg');
    
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 800);
}

document.getElementById('cat-photo').addEventListener('click', (e) => {
    if (isBitten) return;
    createPaw(e);
    
    currentPatience--;
    coins += KOTYAMBUS_CORE[currentCat].mult;

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
    }, 1500);
}

function switchCat(id) {
    currentCat = id;
    currentPatience = KOTYAMBUS_CORE[id].patience;
    document.getElementById('cat-photo').src = KOTYAMBUS_CORE[id].img;
    document.getElementById('cat-name').innerText = KOTYAMBUS_CORE[id].name;
    updateUI();
}

function resetGame() {
    if(confirm("Сбросить прогресс?")) {
        localStorage.clear();
        location.reload();
    }
}

updateUI();
