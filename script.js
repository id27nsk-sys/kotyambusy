const KOTYAMBUS_CORE = {
    basya: { name: "БАСЯ", mult: 1, dir: "images/cats/basya/", gallery: ["b01.jpg", "b02.jpg", "b03.jpg", "b04.jpg", "b05.jpg"] },
    saveliy: { name: "САВЕЛИЙ", mult: 2, dir: "images/cats/savely/", gallery: ["s01.jpg", "s02.jpg", "s03.jpg", "s04.jpg", "s05.jpg"] }
};

let coins = parseInt(localStorage.getItem('coins')) || 0;
let currentCat = localStorage.getItem('current_cat_id') || 'basya';
let imgIndex = 0;
// Счётчик открытых фото
let openedPhotos = JSON.parse(localStorage.getItem('opened_photos')) || { basya: ["b01.jpg"], saveliy: ["s01.jpg"] };

function updateUI() {
    document.getElementById('coins').innerText = coins;
    localStorage.setItem('coins', coins);
    localStorage.setItem('current_cat_id', currentCat);
    localStorage.setItem('opened_photos', JSON.stringify(openedPhotos));

    // Обновление счётчика на экране
    if (currentCat !== 'custom') {
        const cat = KOTYAMBUS_CORE[currentCat];
        document.getElementById('opened-count').innerText = openedPhotos[currentCat].length;
        document.getElementById('total-count').innerText = cat.gallery.length;
        document.querySelector('.gallery-counter').style.opacity = "1";
    } else {
        document.querySelector('.gallery-counter').style.opacity = "0";
    }
}

function nextPhoto() {
    if (currentCat === 'custom') return;
    const cat = KOTYAMBUS_CORE[currentCat];
    imgIndex = (imgIndex + 1) % cat.gallery.length;
    const currentFileName = cat.gallery[imgIndex];

    // Логика "Открытых фото"
    if (!openedPhotos[currentCat].includes(currentFileName)) {
        openedPhotos[currentCat].push(currentFileName);
    }

    document.getElementById('cat-photo').src = cat.dir + currentFileName + "?v=final";
    updateUI();
}

function uploadOwnCat(e) {
    const reader = new FileReader();
    reader.onload = function() {
        const base64 = reader.result;
        localStorage.setItem('custom_cat_data', base64);
        document.getElementById('cat-photo').src = base64;
        currentCat = 'custom';
        document.getElementById('cat-name').innerText = "МОЙ КОТ";
        updateUI();
    };
    reader.readAsDataURL(e.target.files);
}

function createPaw(e) {
    const paw = document.createElement('div');
    paw.innerHTML = '🐾';
    paw.className = 'paw-particle';
    const x = e.clientX || (e.touches && e.touches.clientX);
    const y = e.clientY || (e.touches && e.touches.clientY);
    paw.style.left = x + 'px'; paw.style.top = y + 'px';
    paw.style.setProperty('--tw-x', (Math.random() - 0.5) * 260 + 'px');
    paw.style.setProperty('--tw-y', (Math.random() - 0.5) * 260 + 'px');
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 600);
}

document.getElementById('cat-photo').addEventListener('click', (e) => {
    createPaw(e);
    coins += (currentCat === 'custom') ? 1 : KOTYAMBUS_CORE[currentCat].mult;
    updateUI();
});

function switchCat(id) {
    currentCat = id;
    imgIndex = 0;
    const cat = KOTYAMBUS_CORE[id];
    document.getElementById('cat-photo').src = cat.dir + cat.gallery[0];
    document.getElementById('cat-name').innerText = cat.name;
    updateUI();
}

function resetGame() {
    if(confirm("Сбросить Кото-койны и открытые фото?")) {
        localStorage.clear();
        location.reload();
    }
}

window.onload = () => {
    const savedCustom = localStorage.getItem('custom_cat_data');
    if (savedCustom && currentCat === 'custom') {
        document.getElementById('cat-photo').src = savedCustom;
        document.getElementById('cat-name').innerText = "МОЙ КОТ";
    } else {
        switchCat(currentCat);
    }
    updateUI();
};
