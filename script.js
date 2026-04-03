window.onload = function() {
    console.log("Кото-Кликкер Pro: Финальная сборка");

    // 1. ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
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
        btnReset: document.getElementById('resetButton'),
        themeBtn: document.getElementById('theme-toggle')
    };

    // 2. ДАННЫЕ ИГРЫ
    let data = JSON.parse(localStorage.getItem('cat_V_FINAL_PRO')) || {
        stats: { basya: 0, savely: 0, custom: 0 },
        coins: 0,
        unlockedAchs: [],
        album: { basya: [1], savely: [1] },
        url: null
    };

    let activeCat = 'basya';
    let isGold = false;
    let lastR = { basya: 0, savely: 0, custom: 0 };
    const names = { basya: 'Бася', savely: 'Савелий', custom: 'Свой котик' };
    const cfg = { basya: { p: 'b', t: 3, c: 1 }, savely: { p: 's', t: 3, c: 1 } };

    const achList = [
        { id: 'first_10', n: 'Первые шаги 🐾', desc: '10 кликов одним котом', cond: (d) => Object.values(d.stats).some(v => v >= 10) },
        { id: 'collector', n: 'Фотограф 📸', desc: 'Открыть 3 фото в сумме', cond: (d) => (d.album.basya.length + d.album.savely.length) >= 3 },
        { id: 'rich', n: 'Богатей 💰', desc: 'Собрать 100 коинов', cond: (d) => d.coins >= 100 }
    ];

    const ranks = [
        { n: 'Новичок', m: 0, c: '#888', i: '☁️' },
        { n: 'Любитель', m: 15, c: '#4682b4', i: '❤️' },
        { n: 'Поклонник', m: 30, c: '#008080', i: '🐾' },
        { n: 'Мастер', m: 50, c: '#d4af37', i: '👑' }
    ];

    // 3. ФУНКЦИИ
    const save = () => localStorage.setItem('cat_V_FINAL_PRO', JSON.stringify(data));

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

    function updateAchievements() {
        achList.forEach(ach => {
            if (!data.unlockedAchs.includes(ach.id) && ach.cond(data)) {
                data.unlockedAchs.push(ach.id);
                fx('🌟', 0, 0, true);
                save();
            }
            if (data.unlockedAchs.includes(ach.id) && !document.getElementById(`ach-${ach.id}`)) {
                const div = document.createElement('div');
                div.className = 'achievement';
                div.id = `ach-${ach.id}`;
                div.innerText = ach.n;
                el.achs.appendChild(div);
            }
        });
    }

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

        if (activeCat === 'custom') {
            el.img.src = data.url || '';
            el.btnChange.style.display = 'none';
        } else {
            const num = cfg[activeCat].c.toString().padStart(2, '0');
            el.img.src = `images/cats/${activeCat}/${cfg[activeCat].p}${num}.jpg`;
            el.btnChange.style.display = 'block';
        }

        if (changeColor && !isGold && !document.body.classList.contains('dark-mode')) {
            const h = Math.floor(Math.random() * 360);
            document.documentElement.style.setProperty('--bg-color', `hsl(${h}, 25%, 94%)`);
            document.documentElement.style.setProperty('--accent-color', `hsl(${h}, 60%, 50%)`);
        }
        updateAchievements();
    }

    // 4. СОБЫТИЯ
        // Клик по котику + Система совести
    el.sec.onclick = (e) => {
        if (activeCat === 'custom' && !data.url) { el.fileI.click(); return; }
        
        data.stats[activeCat]++; 
        data.coins++;
        fx('🐾', e.clientX, e.clientY);
        
        // --- ВОЗВРАЩАЕМ СОВЕСТЬ ---
        for (let k in data.stats) {
            if (k !== activeCat && data.stats[activeCat] - data.stats[k] > 25) {
                el.notif.textContent = `А как же ${names[k]}? 😿`;
                el.notif.classList.remove('hidden');
                setTimeout(() => el.notif.classList.add('hidden'), 2000);
                break; // Показываем только одну жалобу за раз
            }
        }
        // --------------------------

        if (data.stats.basya >= 50 && data.stats.savely >= 50) isGold = true;
        update(); 
        save();
    };


    el.btnChange.onclick = () => {
        cfg[activeCat].c = cfg[activeCat].c >= cfg[activeCat].t ? 1 : cfg[activeCat].c + 1;
        if (!data.album[activeCat].includes(cfg[activeCat].c)) data.album[activeCat].push(cfg[activeCat].c);
        update(true); save();
    };

    el.tabs.forEach(t => {
        t.onclick = () => {
            const catType = t.getAttribute('data-cat');
            if (catType === 'custom' && !data.url) el.fileI.click();
            else {
                activeCat = catType;
                el.tabs.forEach(btn => btn.classList.remove('active'));
                t.classList.add('active');
                update(true);
            }
        };
    });

    el.fileI.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            data.url = ev.target.result;
            activeCat = 'custom';
            save(); update(true);
        };
        if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
    };

    // НОЧНОЙ РЕЖИМ
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        el.themeBtn.innerText = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        el.themeBtn.innerText = '☀️';
    }

    el.themeBtn.onclick = toggleTheme;

    // МОДАЛКИ
    document.getElementById('view-stats').onclick = () => {
        el.modalBody.innerHTML = `<h3>🏆 Рекорды</h3><p>Бася: ${data.stats.basya}</p><p>Савелий: ${data.stats.savely}</p>`;
        el.modal.classList.remove('hidden');
    };
    document.getElementById('view-album').onclick = () => {
        el.modalBody.innerHTML = `<h3>🖼️ Галерея</h3><p>Бася: ${data.album.basya.length}/3</p><p>Савелий: ${data.album.savely.length}/3</p>`;
        el.modal.classList.remove('hidden');
    };
    document.getElementById('close-modal').onclick = () => el.modal.classList.add('hidden');

    el.btnReset.onclick = () => { if(confirm("Сброс?")) { localStorage.clear(); location.reload(); }};

    update(true);
};
