// Ждем загрузки страницы, чтобы кнопки нашлись
document.addEventListener('DOMContentLoaded', () => {
    // Берем данные из памяти или ставим 0
    let coins = parseInt(localStorage.getItem('coins')) || 0;
    let basyaCount = parseInt(localStorage.getItem('basyaCount')) || 0;
    let savelyCount = parseInt(localStorage.getItem('savelyCount')) || 0;

    // Ищем твои элементы по ID из index.html
    const coinElem = document.getElementById('coin-count');
    const basyaElem = document.getElementById('basya-count');
    const savelyElem = document.getElementById('savely-count');
    const balanceFill = document.getElementById('balance-fill');

    function updateUI() {
        if(coinElem) coinElem.innerText = coins;
        if(basyaElem) basyaElem.innerText = basyaCount;
        if(savelyElem) savelyElem.innerText = savelyCount;

        // Считаем разницу для шкалы совести
        let diff = Math.abs(basyaCount - savelyCount);
        let progress = Math.max(0, 100 - (diff * 3.33)); 
        if(balanceFill) {
            balanceFill.style.width = progress + "%";
            balanceFill.style.backgroundColor = diff > 25 ? "red" : "#4caf50";
        }
    }

    // Глобальная функция для твоих onclick="clickCat(...)"
    window.clickCat = function(type) {
        let diff = basyaCount - savelyCount;

        if (type === 'basya') {
            if (diff >= 30) {
                alert("Бася зажрался! Глади Савелия!");
                return;
            }
            basyaCount++;
        } else {
            if (diff <= -30) {
                alert("Савелий в ахуе! Глади Басю!");
                return;
            }
            savelyCount++;
        }

        coins++;
        // Сохраняем прогресс
        localStorage.setItem('coins', coins);
        localStorage.setItem('basyaCount', basyaCount);
        localStorage.setItem('savelyCount', savelyCount);
        
        updateUI();
    };

    updateUI();
});
