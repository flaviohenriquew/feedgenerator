// Função para configurar a pré-visualização de áudio e o botão de download
export function setupAudioPreview() {
    const generateButton = document.getElementById('generateButton');
    const audioPreviewContainer = document.getElementById('audioPreviewContainer');
    const audioElement = document.getElementById('audioPreview');
    const downloadButton = document.getElementById('downloadButton');

    generateButton.addEventListener('click', () => {
        // Obtenha os valores do texto e dos controles deslizantes
        const text = document.getElementById('text').value;
        const voice = document.getElementById('voiceSelect').value;
        const language = document.getElementById('languageSelect').value;
        const volume = document.getElementById('volumeControl').value;
        const speed = document.getElementById('speedControl').value;
        const pitch = document.getElementById('pitchControl').value;
        const format = document.getElementById('audioFormat').value;
        const category = document.querySelector('#categoryContainer .active')?.dataset.category;
        const personality = document.querySelector('#personalityContainer .active')?.dataset.personality;

        if (!text || !voice) {
            alert('Por favor, selecione a voz e insira o texto.');
            return;
        }

        // Envia a requisição para gerar o áudio
        fetch('/generate-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                voice,
                language,
                volume,
                speed,
                pitch,
                format,
                category,
                personality
            })
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            
            // Configura o player de áudio
            audioElement.src = url;
            audioPreviewContainer.style.display = 'block';

            // Adiciona o evento 'canplay' para garantir que o áudio seja carregado antes de iniciar a reprodução
            audioElement.addEventListener('canplay', () => {
                audioElement.play().catch(error => {
                    console.error('Erro ao reproduzir o áudio:', error);
                });
            }, { once: true }); // Ouvinte é executado apenas uma vez

            // Inicialize o MediaElement.js no player de áudio
            new MediaElementPlayer(audioElement, {
                features: ['playpause', 'progress', 'current', 'duration', 'volume', 'download'],
                enableAutosize: true,
                success: function(media) {
                    media.setCurrentTime(0);  // Reseta o tempo para 0 quando o áudio termina
                }
            });

            // Configura o botão de download
            downloadButton.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'output.mp3';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        })
        .catch(() => alert('Erro ao gerar o áudio.'));
    });
}
