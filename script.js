window.onload = function() {
    console.log("КОТЯМЬБУСЬ! v2.9.5: Система готова.");

    let coins = parseInt(localStorage.getItem('coins')) || 0;
    let basyaCount = parseInt(localStorage.getItem('basyaCount')) || 0;
    let savelyCount = parseInt(localStorage.getItem('savelyCount')) || 0;
    let activeCat = localStorage.getItem('activeCat') || 'basya';

    const coinElem = document.getElementById('coin-count');
    const catNameElem = document.getElementById('current-cat-name');
    const catImgElem = document.getElementById('current-cat-img');
    const rankElem = document.getElementById('rank-text');

    function updateUI() {
        if (coinElem) coinElem.innerText = coins;
        
        // Система статусов
        if (coins > 1000) rankElem.innerText = "Король Котов 👑";
        else if (coins > 500) rankElem.innerText = "Котомаг 🧙‍♂️";
        else if (coins > 100) rankElem.innerText = "Любитель 🐾";
        else rankElem.innerText = "Новичок 🐾";

        // Обновление активной кнопки
        document.querySelectorAll('.sel-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase().includes(activeCat)) btn.classList.add('active');
        });

        // Смена картинки и имени
        if (activeCat === 'user') {
            catImgElem.src = localStorage.getItem('userCatImg') || 'images/cats/basya/b01.jpg';
            catNameElem.innerText = 'МОЙ КОТ';
        } else {
            catImgElem.src = activeCat === 'basya' ? 'images/cats/basya/b01.jpg' : 'images/cats/savely/s01.jpg';
            catNameElem.innerText = activeCat === 'basya' ? 'БАСЯ' : 'САВЕЛИЙ';
        }
    }

    window.switchCat = function(type) {
        activeCat = type;
        localStorage.setItem('activeCat', type);
        updateUI();
    };

    window.handleUserCat = function(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                localStorage.setItem('userCatImg', e.target.result);
                activeCat = 'user';
                localStorage.setItem('activeCat', 'user');
                updateUI();
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.handleMainClick = function() {
        coins++;
        if (activeCat === 'basya') basyaCount++;
        else if (activeCat === 'savely') savelyCount++;
        
        localStorage.setItem('coins', coins);
        localStorage.setItem('basyaCount', basyaCount);
        localStorage.setItem('savelyCount', savelyCount);
        updateUI();
    };

    window.changeBackground = function() {
        const colors = ['#f4f4f9', '#ffe4e1', '#e0ffff', '#f5f5dc', '#e6e6fa', '#fafad2'];
        const random = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.background = random;
        localStorage.setItem('currentBg', random);
    };

    window.resetData = function() {
        if (confirm("🚨 Удалить весь прогресс, монеты и фото своего кота?")) {
            localStorage.clear();
            location.reload();
        }
    };

    const savedBg = localStorage.getItem('currentBg');
    if (savedBg) document.body.style.background = savedBg;

    updateUI();
};
function createPaw(e) {
    const paw = document.createElement('div');
    paw.innerHTML = '🐾'; // Можно заменить на 🐱 или 🦴
    paw.className = 'paw-particle';
    
    // Позиция клика
    const x = e.clientX;
    const y = e.clientY;
    
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    
    // Рандомное направление разлета
    const destX = (Math.random() - 0.5) * 200;
    const destY = (Math.random() - 0.5) * 200;
    const rotation = Math.random() * 360;
    
    paw.style.setProperty('--tw-x', `${destX}px`);
    paw.style.setProperty('--tw-y', `${destY}px`);
    paw.style.setProperty('--tw-r', `${rotation}deg`);
    
    document.body.appendChild(paw);
    
    // Удаляем из DOM после анимации
    setTimeout(() => paw.remove(), 1000);
}

// Привязываем к клику по фото кота
document.querySelector('.cat-image').addEventListener('click', createPaw);
