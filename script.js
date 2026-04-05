// Инициализация данных
let coins = parseInt(localStorage.getItem('coins')) || 0;
let basyaClicks = parseInt(localStorage.getItem('basyaClicks')) || 0;
let savelyClicks = parseInt(localStorage.getItem('savelyClicks')) || 0;

// Элементы интерфейса
const coinDisplay = document.getElementById('coin-count');
const basyaDisplay = document.getElementById('basya-count');
const savelyDisplay = document.getElementById('savely-count');
const balanceBar = document.getElementById('balance-fill');

// Обновление UI при загрузке
function updateUI() {
    coinDisplay.innerText = coins;
    basyaDisplay.innerText = basyaClicks;
    savelyDisplay.innerText = savelyClicks;
    
    // Расчет шкалы баланса (разница не более 30)
    const diff = Math.abs(basyaClicks - savelyClicks);
    const progress = Math.max(0, 100 - (diff * 3.33)); // 30 кликов = 100%
    balanceBar.style.width = progress + "%";
    
    if (diff > 30) {
        balanceBar.style.backgroundColor = "red";
    } else {
        balanceBar.style.backgroundColor = "#4caf50";
    }
}

// Функция клика
function clickCat(cat) {
    const diff = Math.abs(basyaClicks - savelyClicks);
    
    if (cat === 'basya') {
        if (basyaClicks - savelyClicks >= 30) {
            alert("Нужен баланс! Погладь Савелия!");
            return;
        }
        basyaClicks++;
    } else {
        if (savelyClicks - basyaClicks >= 30) {
            alert("Нужен баланс! Погладь Басю!");
            return;
        }
        savelyClicks++;
    }
    
    coins++;
    saveData();
    updateUI();
}

// Сохранение
function saveData() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('basyaClicks', basyaClicks);
    localStorage.setItem('savelyClicks', savelyClicks);
}

// Инициализация
updateUI();
