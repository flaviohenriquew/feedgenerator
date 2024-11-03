// Importar funções de outros módulos
import { loadLanguages, loadVoices } from './tts.js';
import { loadVoiceEffects } from './voiceEffects.js';
import { initializeRSSFetch } from './rss.js';
import { initializeCharacterCounter, initializeSliders } from './utils.js';
import { setupAudioPreview } from './audioPlayer.js';
import { initializePlaylistSorting } from './playlist.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o carregamento de idiomas e vozes para TTS
    loadLanguages();
    loadVoiceEffects();

    // Configuração de contadores e controles deslizantes
    initializeCharacterCounter('#text', '#charCount');
    initializeSliders();

    // Configuração de pré-visualização de áudio
    setupAudioPreview();

    // Inicializa o Fetch para RSS
    initializeRSSFetch();

    // Inicializa a funcionalidade de ordenação de playlist M3U
    initializePlaylistSorting();

    // Adiciona event listener para atualizar as vozes quando o idioma é alterado
    document.getElementById('languageSelect').addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        loadVoices(selectedLanguage);
    });
    
});
