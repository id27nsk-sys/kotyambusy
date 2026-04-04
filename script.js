// === 1. ИНИЦИАЛИЗАЦИЯ ДАННЫХ ===
let coins = parseInt(localStorage.getItem('coins')) || 0;
let catStats = JSON.parse(localStorage.getItem('catStats')) || { basya: 0, savely: 0, custom: 0 };
let currentCat = 'basya';
let isVoiceActive = false; // Состояние голосового управления (выключено по умолчанию)

const catImages = {
    basya: ['images/cats/basya/b01.jpg'], // Добавь сюда пути к фото, если их много
    savely: ['images/cats/savely/s01.jpg'],
    custom: []
};

// === 2. ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ===
const coinsDisplay = document.getElementById('coins');
const counterDisplay = document.getElementById('counter');
const progressFill = document.getElementById('progress-fill');
const rankText = document.getElementById('rank-text');
const catImage = document.getElementById('catImage');
const notification = document.getElementById('notification');

// === 3. ОСНОВНАЯ ЛОГИКА ИГРЫ ===

// Обновление экрана
function updateUI() {
    coinsDisplay.innerText = coins;
    const clicks = catStats[currentCat];
    counterDisplay.innerText = `${currentCat === 'basya' ? 'Бася' : currentCat === 'savely' ? 'Савелий' : 'Свой котик'}: ${clicks}`;
    
    // Прогресс ранга (каждые 100 кликов - новый уровень до 500)
    const progress = (clicks % 100);
    progressFill.style.width = progress + '%';
    
    updateRank(clicks);
    localStorage.setItem('coins', coins);
    localStorage.setItem('catStats', JSON.stringify(catStats));
}

function updateRank(clicks) {
    let rank = "Новичок";
    let icon = "☁️";
    if (clicks >= 100) { rank = "Любитель"; icon = "🌟"; }
    if (clicks >= 200) { rank = "Мастер"; icon = "🔥"; }
    if (clicks >= 300) { rank = "Легенда"; icon = "👑"; }
    if (clicks >= 500) { 
        rank = "БОГ КОТОВ"; icon = "✨"; 
        catImage.classList.add('golden-mode'); // Золотой режим
    }
    document.getElementById('rank-text').innerText = rank;
    document.getElementById('rank-icon').innerText = icon;
}

// Уведомления
function showNotification(text) {
    notification.innerText = text;
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Эффект лапок при клике
function createPaw(e) {
    const paw = document.createElement('div');
    paw.className = 'paw-particle';
    // Используем твой favicon.png для лапок
    paw.innerHTML = `<img src="images/favicon.png" style="width:30px; height:30px;">`;
    
    // Случайный разлет
    const tx = (Math.random() - 0.5) * 200 + 'px';
    const ty = (Math.random() * -150 - 50) + 'px';
    const tr = (Math.random() * 360) + 'deg';
    
    paw.style.setProperty('--tx', tx);
    paw.style.setProperty('--ty', ty);
    paw.style.setProperty('--tr', tr);
    
    paw.style.left = e.clientX + 'px';
    paw.style.top = e.clientY + 'px';
    
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 800);
}

// Обработка клика по коту
catImage.parentElement.addEventListener('click', (e) => {
    coins++;
    catStats[currentCat]++;
    createPaw(e);
    updateUI();
});

// Переключение табов
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tab-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        
        // Смена картинки
        if (currentCat !== 'custom') {
            catImage.src = catImages[currentCat][0];
        }
        updateUI();
    });
});

// Тёмная тема
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('theme-toggle').innerText = isDark ? '☀️' : '🌙';
});

// Сброс
document.getElementById('resetButton').addEventListener('click', () => {
    if(confirm("Точно сбросить весь прогресс?")) {
        localStorage.clear();
        location.reload();
    }
});

// === 4. ГОЛОСОВОЕ УПРАВЛЕНИЕ (SMART MODE) ===

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last].transcript.toLowerCase().trim();
        
        console.log('Услышано:', command);

        // Команды активации
        if (command.includes('включи голос') || command.includes('слушай')) {
            isVoiceActive = true;
            showNotification("Голосовое управление ВКЛЮЧЕНО 🎤");
            return;
        } 
        
        if (command.includes('отключи голос') || command.includes('отдыхай') || command.includes('тишина')) {
            isVoiceActive = false;
            showNotification("Голосовое управление ОТКЛЮЧЕНО 🤫");
            return;
        }

        // Выполнение команд, если режим активен
        if (isVoiceActive) {
            if (command.includes('бася')) {
                const btn = document.querySelector('[data-cat="basya"]');
                if (btn) btn.click();
            } 
            else if (command.includes('савелий') || command.includes('савель')) {
                const btn = document.querySelector('[data-cat="savely"]');
                if (btn) btn.click();
            }
            else if (command.includes('смени') || command.includes('фото')) {
                document.getElementById('changeCatButton').click();
            }
        }
    };

    // Авто-перезапуск сессии (тихий)
    recognition.onend = () => {
        recognition.start();
    };

    // Старт при загрузке
    window.addEventListener('DOMContentLoaded', () => {
        recognition.start();
        updateUI(); // Первичное обновление экрана
    });

} else {
    showNotification("Голос не поддерживается вашим браузером");
}
