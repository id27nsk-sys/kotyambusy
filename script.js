// Ждем загрузки окна, чтобы всё нашлось
window.onload = function() {
    console.log("Kotyambusy Script: START");

    // Загрузка данных
    let coins = parseInt(localStorage.getItem('coins')) || 0;
    let basyaCount = parseInt(localStorage.getItem('basyaCount')) || 0;
    let savelyCount = parseInt(localStorage.getItem('savelyCount')) || 0;

    // Элементы интерфейса
    const coinElem = document.getElementById('coin-count');
    const basyaElem = document.getElementById('basya-count');
    const savelyElem = document.getElementById('savely-count');
    const balanceFill = document.getElementById('balance-fill');

    function updateUI() {
        if (coinElem) coinElem.innerText = coins;
        if (basyaElem) basyaElem.innerText = basyaCount;
        if (savelyElem) savelyElem.innerText = savelyCount;

        // Логика шкалы (разница до 30)
        let diff = Math.abs(basyaCount - savelyCount);
        let progress = Math.max(0, 100 - (diff * 3.33));
        
        if (balanceFill) {
            balanceFill.style.width = progress + "%";
            balanceFill.style.backgroundColor = diff > 25 ? "#ff4444" : "#4caf50";
        }
    }

    // Глобальная функция клика
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

    updateUI();
};
