window.onload = function() {
    console.log("КОТЯМЬБУСЬ! v2.8.4: База зафиксирована.");

    let coins = parseInt(localStorage.getItem('coins')) || 0;
    let basyaCount = parseInt(localStorage.getItem('basyaCount')) || 0;
    let savelyCount = parseInt(localStorage.getItem('savelyCount')) || 0;

    const coinElem = document.getElementById('coin-count');
    const basyaElem = document.getElementById('basya-count');
    const savelyElem = document.getElementById('savely-count');
    const balanceFill = document.getElementById('balance-fill');
    const bodyBg = document.body;

    const backgrounds = ['#f4f4f9', '#ffe4e1', '#e0ffff', '#f5f5dc', '#e6e6fa', '#fafad2'];

    function updateUI() {
        if (coinElem) coinElem.innerText = coins;
        if (basyaElem) basyaElem.innerText = basyaCount;
        if (savelyElem) savelyElem.innerText = savelyCount;

        let diff = Math.abs(basyaCount - savelyCount);
        let progress = Math.max(0, 100 - (diff * 3.33));
        
        if (balanceFill) {
            balanceFill.style.width = progress + "%";
            balanceFill.style.backgroundColor = diff > 25 ? "#ff4444" : "#4caf50";
        }
    }

    window.changeBackground = function() {
        const randomColor = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        bodyBg.style.background = randomColor;
        localStorage.setItem('currentBg', randomColor);
    };

    window.handleCatClick = function(type) {
        let currentDiff = basyaCount - savelyCount;
        if (type === 'basya') {
            if (currentDiff >= 30) { alert("Баланс! Погладь Савелия!"); return; }
            basyaCount++;
        } else {
            if (currentDiff <= -30) { alert("Баланс! Погладь Басю!"); return; }
            savelyCount++;
        }
        coins++;
        localStorage.setItem('coins', coins);
        localStorage.setItem('basyaCount', basyaCount);
        localStorage.setItem('savelyCount', savelyCount);
        updateUI();
    };

    const savedBg = localStorage.getItem('currentBg');
    if (savedBg) bodyBg.style.background = savedBg;
    updateUI();
};
