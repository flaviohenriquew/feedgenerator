// Função para inicializar o contador de caracteres em um campo de texto
export function initializeCharacterCounter(textSelector, counterSelector) {
    const textarea = document.querySelector(textSelector);
    const charCount = document.querySelector(counterSelector);

    textarea.addEventListener('input', () => {
        const currentLength = textarea.value.length;
        charCount.textContent = `${currentLength} caracteres usados`;
    });
}

// Função para inicializar os controles deslizantes de volume, velocidade e tom de voz
export function initializeSliders() {
    const volumeSlider = document.getElementById('volumeControl');
    const speedSlider = document.getElementById('speedControl');
    const pitchSlider = document.getElementById('pitchControl');
    const volumeValue = document.getElementById('volumeValue');
    const speedValue = document.getElementById('speedValue');
    const pitchValue = document.getElementById('pitchValue');

    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', () => {
            volumeValue.textContent = `${volumeSlider.value} dB`;
        });
    }

    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', () => {
            speedValue.textContent = `${speedSlider.value}%`;
        });
    }

    if (pitchSlider && pitchValue) {
        pitchSlider.addEventListener('input', () => {
            pitchValue.textContent = `${pitchSlider.value}%`;
        });
    }
}
