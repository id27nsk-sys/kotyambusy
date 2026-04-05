// Инициализация
let coins = parseInt(localStorage.getItem('coins')) || 0;
let basyaCount = parseInt(localStorage.getItem('basyaCount')) || 0;
let savelyCount = parseInt(localStorage.getItem('savelyCount')) || 0;

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('basya-count').innerText = basyaCount;
    document.getElementById('savely-count').innerText = savelyCount;

    let diff = Math.abs(basyaCount - savelyCount);
    let progress = Math.max(0, 100 - (diff * 3.33));
    let fill = document.getElementById('balance-fill');
    
    if (fill) {
        fill.style.width = progress + "%";
        fill.style.backgroundColor = diff > 25 ? "#ff4444" : "#4caf50";
    }
}

window.handleCatClick = function(type) {
    let currentDiff = basyaCount - savelyCount;

    if (type === 'basya') {
        if (currentDiff >= 30) {
            alert("Нужен баланс! Погладь Савелия!");
            return;
        }
        basyaCount++;
    } else {
        if (currentDiff <= -30) {
            alert("Нужен баланс! Погладь Басю!");
            return;
        }
        savelyCount++;
    }

    coins++;
    localStorage.setItem('coins', coins);
    localStorage.setItem('basyaCount', basyaCount);
    localStorage.setItem('savelyCount', savelyCount);
    updateUI();
    
    if (navigator.vibrate) navigator.vibrate(10);
};

// Запуск
document.addEventListener('DOMContentLoaded', updateUI);
