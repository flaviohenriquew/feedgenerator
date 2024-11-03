// Função para configurar a pré-visualização de áudio e o botão de download
export function setupAudioPreview() {
    const generateButton = document.getElementById('generateButton');
    const audioPreviewContainer = document.getElementById('audioPreviewContainer');
    const audioElement = document.getElementById('audioPreview');
    const downloadButton = document.getElementById('downloadButton');

    // Define uma função de download que será usada apenas uma vez por geração de áudio
    let currentDownloadUrl = null;

    function handleDownload() {
        if (!currentDownloadUrl) return;
        const a = document.createElement('a');
        a.href = currentDownloadUrl;
        a.download = 'output.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    generateButton.addEventListener('click', () => {
        // Desabilita o botão para evitar cliques múltiplos enquanto o áudio é processado
        generateButton.disabled = true;

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
            generateButton.disabled = false; // Reabilita o botão
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
            // Cria um URL para o novo blob de áudio e armazena em currentDownloadUrl
            currentDownloadUrl = URL.createObjectURL(blob);
            
            // Configura o player de áudio
            audioElement.src = currentDownloadUrl;
            audioPreviewContainer.style.display = 'block';

            // Reproduz o áudio assim que ele estiver pronto
            audioElement.addEventListener('canplay', () => {
                audioElement.play().catch(error => {
                    console.error('Erro ao reproduzir o áudio:', error);
                });
            }, { once: true }); // Ouvinte é executado apenas uma vez

            // Inicializa o MediaElement.js no player de áudio
            new MediaElementPlayer(audioElement, {
                features: ['playpause', 'progress', 'current', 'duration', 'volume', 'loop', 'download'],
                audioVolume: 'horizontal',
                defaultSeekBackwardInterval: 5,
                defaultSeekForwardInterval: 5,
                enableAutosize: true,
                enableKeyboard: true,
                success: function(media) {
                    media.setCurrentTime(0);  // Reseta o tempo para 0 quando o áudio termina
                }
            });

            // Remove ouvintes antigos e adiciona um novo para o URL atual
            downloadButton.removeEventListener('click', handleDownload);
            downloadButton.addEventListener('click', handleDownload);

            // Reabilita o botão de geração de áudio
            generateButton.disabled = false;
        })
        .catch(() => {
            alert('Erro ao gerar o áudio.');
            generateButton.disabled = false; // Reabilita o botão em caso de erro
        });
    });
}
