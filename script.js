// Загрузка сохраненных данных из LocalStorage
let b = parseInt(localStorage.getItem('basya')) || 0;
let s = parseInt(localStorage.getItem('saveliy')) || 0;
let c = parseInt(localStorage.getItem('coins')) || 0;

/**
 * Функция синхронизации данных с интерфейсом
 */
function updateUI() {
    const bCount = document.getElementById('basya-count');
    const sCount = document.getElementById('saveliy-count');
    const cCount = document.getElementById('coins');
    const ind = document.getElementById('indicator');
    const status = document.getElementById('status-text');

    if (bCount) bCount.innerText = b;
    if (sCount) sCount.innerText = s;
    if (cCount) cCount.innerText = c;

    // Расчет положения индикатора шкалы (баланс в пределах 30 кликов)
    const diff = s - b;
    let p = 50 + (diff / 60) * 100;
    p = Math.max(5, Math.min(95, p)); // Ограничиваем края полоски
    if (ind) ind.style.width = p + '%';

    // Проверка кошачьей совести (критическая разница — 30)
    if (Math.abs(diff) >= 30) {
        if (ind) ind.style.background = '#e74c3c'; // Красный цвет при обиде
        if (status) status.innerText = "⚠️ КТО-ТО ОБИЖЕН!";
    } else {
        if (ind) ind.style.background = '#2ecc71'; // Зеленый в балансе
        if (status) status.innerText = "🐾 Балансируй котов!";
    }

    // Сохранение текущего прогресса
    localStorage.setItem('basya', b);
    localStorage.setItem('saveliy', s);
    localStorage.setItem('coins', c);
}

// Обработка клика на Басю
document.getElementById('basya-card').onclick = () => { 
    b++; c++; 
    if(navigator.vibrate) navigator.vibrate(12); // Вибрация для мобилок
    updateUI(); 
};

// Обработка клика на Савелия
document.getElementById('saveliy-card').onclick = () => { 
    s++; c++; 
    if(navigator.vibrate) navigator.vibrate(12); 
    updateUI(); 
};

// Первичная отрисовка данных при загрузке страницы
updateUI();
