// === УЛУЧШЕННОЕ ГОЛОСОВОЕ УПРАВЛЕНИЕ ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false; // Флаг: реагируем ли мы на команды "Бася/Савелий"

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = true; // Слушаем долго
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last].transcript.toLowerCase().trim();
        console.log('Голос услышал:', command);

        // Команды активации системы
        if (command.includes('включи голос') || command.includes('слушай')) {
            isListening = true;
            showNotification("Голосовые команды ВКЛЮЧЕНЫ 🎤");
            return;
        }

        // Команды ПОЛНОГО засыпания
        if (command.includes('отключи голос') || command.includes('тишина') || command.includes('отдыхай')) {
            isListening = false;
            showNotification("Голосовые команды ОТКЛЮЧЕНЫ 🤫");
            // Мы НЕ останавливаем recognition совсем, чтобы он мог услышать "Включи голос" позже,
            // но он больше не будет "пиликать" перезапусками, так как continuous = true
            return;
        }

        // Выполнение действий (только если мы в режиме прослушки)
        if (isListening) {
            if (command.includes('бася')) {
                const btn = document.querySelector('[data-cat="basya"]');
                if (btn) btn.click();
            } 
            else if (command.includes('савелий') || command.includes('савель')) {
                const btn = document.querySelector('[data-cat="savely"]');
                if (btn) btn.click();
            }
        }
    };

    // Чтобы не было постоянных "пиликаний" при перезапуске:
    // Мы запускаем его один раз и полагаемся на continuous = true.
    recognition.onend = () => {
        // Перезапускаем только если произошла ошибка или системный сбой
        // В нормальном режиме continuous держит связь долго
        recognition.start();
    };

    window.addEventListener('DOMContentLoaded', () => {
        recognition.start();
    });
}
