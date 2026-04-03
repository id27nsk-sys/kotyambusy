window.onload = function() {
    console.log("Кото-Кликкер Pro: Финальная сборка загружена");

    // 1. ССЫЛКИ НА ЭЛЕМЕНТЫ
    const el = {
        img: document.getElementById('catImage'),
        sec: document.getElementById('cat-image-section'),
        cnt: document.getElementById('counter'),
        coins: document.getElementById('coins'),
        prog: document.getElementById('progress-fill'),
        rankT: document.getElementById('rank-text'),
        rankI: document.getElementById('rank-icon'),
        tabs: document.querySelectorAll('.tab-btn'),
        achs: document.getElementById('achievements-container'),
        notif: document.getElementById('notification'),
        modal: document.getElementById('modal-overlay'),
        modalBody: document.getElementById('modal-body'),
        fileI: document.getElementById('file-input'),
        btnChange: document.getElementById('changeCatButton'),
        themeBtn: document.getElementById('theme-toggle'),
        btnReset: document.getElementById('resetButton')
    };

    // 2. ДАННЫЕ ИГРЫ
    let data = JSON.parse(localStorage.getItem('cat_V_FINAL_PRO')) || {
        stats: { basya: 0, savely: 0, custom: 0 },
        coins: 0,
        unlockedAchs: [],
        album: { basya: [1], savely: [1] }, // Начинаем с первого открытого фото
        url: null
    };

    let activeCat = 'basya';
    let isGold = false;
    let lastR = { basya: 0, savely: 0, custom: 0 };
    let totalPhotosCount = { basya: 1, savely: 1 }; // Сюда запишем реальное число файлов при старте

    const names = { basya: 'Бася', savely: 'Савелий', custom: 'Свой котик' };
    const cfg = { basya: { p: 'b', c: 1 }, savely: { p: 's', c: 1 } };
    
    const ranks = [
        { n: 'Новичок', m: 0, c: '#888', i: '☁️' },
        { n: 'Любитель', m: 15, c: '#4682b4', i: '❤️' },
        { n: 'Поклонник', m: 30, c: '#008080', i: '🐾' },
        { n: 'Мастер', m: 50, c: '#d4af37', i: '👑' }
    ];

    const save = () => localStorage.setItem('cat_V_FINAL_PRO', JSON.stringify(data));

    // 3. ФУНКЦИИ
    
    // Динамический подсчет фото в папках при загрузке
    async function precountPhotos(cat) {
        let count = 0;
        let found = true;
        while (found && count < 50) { // Лимит 50 для безопасности
            count++;
            let path = `images/cats/${cat}/${cfg[cat].p}${count.toString().padStart(2, '0')}.jpg`;
            found = await new Promise(res => {
                let test = new Image();
                test.src = path;
                test.onload = () => res(true);
                test.onerror = () => res(false);
            });
            if (found) totalPhotosCount[cat] = count;
        }
    }

    // Частицы (лапки и фейерверки)
    function fx(txt, x, y, isFull = false) {
        const amount = isFull ? 30 : 1;
        for (let i = 0; i < amount; i++) {
            const p = document.createElement('div');
            p.className = 'paw-particle'; p.innerText = txt;
            p.style.left = (isFull ? window.innerWidth / 2 : x) + 'px';
            p.style.top = (isFull ? window.innerHeight / 2 : y) + 'px';
            p.style.setProperty('--tx', (Math.random() - 0.5) * (isFull ? 500 : 200) + 'px');
            p.style.setProperty('--ty', (isFull ? (Math.random() - 0.5) * 500 : -150) + 'px');
            p.style.setProperty('--tr', Math.random() * 360 + 'deg');
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }

    // Обновление интерфейса
    function update(changeColor = false) {
        const count = data.stats[activeCat] || 0;
        el.cnt.textContent = `${names[activeCat]}: ${count}`;
        el.coins.textContent = data.coins;
        
        let rIdx = 0;
        ranks.forEach((r, i) => { if(count >= r.m) rIdx = i; });
        const R = ranks[rIdx];

        if (rIdx > (lastR[activeCat] || 0)) {
            lastR[activeCat] = rIdx;
            if (count > 0) fx('🎆', 0, 0, true);
        }

        el.rankT.textContent = R.n; el.rankI.textContent = R.i;
        const next = ranks[rIdx + 1];
        el.prog.style.width = next ? Math.min(100, ((count - R.m) / (next.m - R.m)) * 100) + '%' : '100%';
        el.prog.style.background = isGold ? 'gold' : R.c;

        // Фото котика
        if (activeCat === 'custom') {
            el.img.src = data.url || 'images/cats/placeholder.jpg';
            el.btnChange.style.display = 'none';
        } else {
            const num = cfg[activeCat].c.toString().padStart(2, '0');
            el.img.src = `images/cats/${activeCat}/${cfg[activeCat].p}${num}.jpg`;
            el.btnChange.style.display = 'block';
        }

        // Рандомный цвет фона (только в светлой теме)
        if (changeColor && !isGold && !document.body.classList.contains('dark-mode')) {
            const h = Math.floor(Math.random() * 360);
            document.documentElement.style.setProperty('--bg-color', `hsl(${h}, 25%, 94%)`);
            document.documentElement.style.setProperty('--accent-color', `hsl(${h}, 60%, 50%)`);
        }
        
        save();
    }

    // 4. СОБЫТИЯ

    // Клик по коту (универсальный)
    el.sec.onpointerdown = (e) => {
        if (activeCat === 'custom' && !data.url) { el.fileI.click(); return; }
        
        data.stats[activeCat]++; 
        data.coins++;
        fx('🐾', e.clientX, e.clientY);
        
        // Система совести
        for (let k in data.stats) {
            // Пропускаем проверку своего котика, если фото нет
            if (k === 'custom' && !data.url) continue;

            if (k !== activeCat && data.stats[activeCat] - data.stats[k] > 25) {
                el.notif.textContent = `А как же ${names[k]}? 😿`;
                el.notif.classList.remove('hidden');
                setTimeout(() => el.notif.classList.add('hidden'), 2000);
                break;
            }
        }
        update();
    };

    // Умная смена фото (поиск следующего файла)
    el.btnChange.onclick = () => {
        let nextNum = cfg[activeCat].c + 1;
        let nextPath = `images/cats/${activeCat}/${cfg[activeCat].p}${nextNum.toString().padStart(2, '0')}.jpg`;
        
        let testImg = new Image();
        testImg.src = nextPath;
        
        testImg.onload = () => {
            cfg[activeCat].c = nextNum;
            if (!data.album[activeCat].includes(nextNum)) data.album[activeCat].push(nextNum);
            update(true); // Меняем цвет фона при смене фото
        };
        
        testImg.onerror = () => { 
            cfg[activeCat].c = 1; // Если файла нет — в начало
            update(true); 
        };
    };

    // Переключение табов
    el.tabs.forEach(t => {
        t.onclick = () => {
            const catType = t.getAttribute('data-cat');
            if (catType === 'custom' && !data.url) {
                el.fileI.click();
            } else {
                activeCat = catType;
                el.tabs.forEach(btn => btn.classList.remove('active'));
                t.classList.add('active');
                update(true); // Меняем цвет фона при смене таба
            }
        };
    });

    // Загрузка своего фото
    el.fileI.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            data.url = ev.target.result;
            activeCat = 'custom';
            el.tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.cat === 'custom'));
            update(true);
        };
        if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
    };

    // Ночной режим
    el.themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        el.themeBtn.innerText = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        el.themeBtn.innerText = '☀️';
    }

    // Галерея-карусель
    document.getElementById('view-album').onclick = () => {
        let html = `<h3>🖼️ Коллекция</h3>`;
        ['basya', 'savely'].forEach(cat => {
            const opened = data.album[cat].length;
            const total = totalPhotosCount[cat];
            html += `<p style="margin-top:10px"><b>${names[cat]}:</b> открыто ${opened} из ${total}</p>`;
            html += `<div class="carousel">`;
            data.album[cat].sort((a,b)=>a-b).forEach(num => {
                let path = `images/cats/${cat}/${cfg[cat].p}${num.toString().padStart(2, '0')}.jpg`;
                html += `<img src="${path}" alt="cat">`;
            });
            html += `</div>`;
        });
        el.modalBody.innerHTML = html;
        el.modal.classList.remove('hidden');
    };

    // Рекорды
    document.getElementById('view-stats').onclick = () => {
        el.modalBody.innerHTML = `<h3>🏆 Рекорды</h3><br><p>Бася: ${data.stats.basya}</p><p>Савелий: ${data.stats.savely}</p><p>Свой кот: ${data.stats.custom}</p>`;
        el.modal.classList.remove('hidden');
    };

    document.getElementById('close-modal').onclick = () => el.modal.classList.add('hidden');

    el.btnReset.onclick = () => {
        if(confirm("Сбросить весь прогресс и очистить память?")) {
            localStorage.clear();
            location.reload();
        }
    };

    // 5. ИНИЦИАЛИЗАЦИЯ (СТАРТ)
    (async () => {
        // Считаем реальное кол-во фото перед первым показом
        await precountPhotos('basya');
        await precountPhotos('savely');
        update(true);
    })();
};
