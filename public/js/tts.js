// Função para carregar idiomas disponíveis
export function loadLanguages() {
    $.ajax({
        url: '/get-languages',
        type: 'GET',
        success: function(languages) {
            const languageSelect = $('#languageSelect');
            languageSelect.empty(); // Limpa as opções atuais

            // Mapeamento de códigos de idiomas para nomes amigáveis
            const languageMap = {
                "af-ZA": "Africâner (África do Sul)",
                "sq-AL": "Albanês (Albânia)",
                "am-ET": "Amárico (Etiópia)",
                "ar-DZ": "Árabe (Argélia)",
                "ar-BH": "Árabe (Bahrein)",
                "ar-EG": "Árabe (Egito)",
                "ar-IQ": "Árabe (Iraque)",
                "ar-JO": "Árabe (Jordânia)",
                "ar-KW": "Árabe (Kuwait)",
                "ar-LB": "Árabe (Líbano)",
                "ar-LY": "Árabe (Líbia)",
                "ar-MA": "Árabe (Marrocos)",
                "ar-OM": "Árabe (Omã)",
                "ar-QA": "Árabe (Catar)",
                "ar-SA": "Árabe (Arábia Saudita)",
                "ar-SY": "Árabe (Síria)",
                "ar-TN": "Árabe (Tunísia)",
                "ar-AE": "Árabe (Emirados Árabes Unidos)",
                "ar-YE": "Árabe (Iêmen)",
                "az-AZ": "Azeri (Azerbaijão)",
                "bn-BD": "Bengali (Bangladesh)",
                "bn-IN": "Bengali (Índia)",
                "bs-BA": "Bósnio (Bósnia e Herzegovina)",
                "bg-BG": "Búlgaro (Bulgária)",
                "my-MM": "Birmanês (Myanmar)",
                "ca-ES": "Catalão (Espanha)",
                "zh-HK": "Chinês (Hong Kong)",
                "zh-CN": "Chinês (China)",
                "zh-CN-liaoning": "Chinês (Liaoning, China)",
                "zh-TW": "Chinês (Taiwan)",
                "zh-CN-shaanxi": "Chinês (Shaanxi, China)",
                "hr-HR": "Croata (Croácia)",
                "cs-CZ": "Tcheco (República Tcheca)",
                "da-DK": "Dinamarquês (Dinamarca)",
                "nl-BE": "Holandês (Bélgica)",
                "nl-NL": "Holandês (Países Baixos)",
                "en-AU": "Inglês (Austrália)",
                "en-CA": "Inglês (Canadá)",
                "en-HK": "Inglês (Hong Kong)",
                "en-IN": "Inglês (Índia)",
                "en-IE": "Inglês (Irlanda)",
                "en-KE": "Inglês (Quênia)",
                "en-NZ": "Inglês (Nova Zelândia)",
                "en-NG": "Inglês (Nigéria)",
                "en-PH": "Inglês (Filipinas)",
                "en-SG": "Inglês (Cingapura)",
                "en-ZA": "Inglês (África do Sul)",
                "en-TZ": "Inglês (Tanzânia)",
                "en-GB": "Inglês (Reino Unido)",
                "en-US": "Inglês (Estados Unidos)",
                "et-EE": "Estoniano (Estônia)",
                "fil-PH": "Filipino (Filipinas)",
                "fi-FI": "Finlandês (Finlândia)",
                "fr-BE": "Francês (Bélgica)",
                "fr-CA": "Francês (Canadá)",
                "fr-FR": "Francês (França)",
                "fr-CH": "Francês (Suíça)",
                "gl-ES": "Galego (Espanha)",
                "ka-GE": "Georgiano (Geórgia)",
                "de-AT": "Alemão (Áustria)",
                "de-DE": "Alemão (Alemanha)",
                "de-CH": "Alemão (Suíça)",
                "el-GR": "Grego (Grécia)",
                "gu-IN": "Guzerate (Índia)",
                "he-IL": "Hebraico (Israel)",
                "hi-IN": "Hindi (Índia)",
                "hu-HU": "Húngaro (Hungria)",
                "is-IS": "Islandês (Islândia)",
                "id-ID": "Indonésio (Indonésia)",
                "ga-IE": "Irlandês (Irlanda)",
                "it-IT": "Italiano (Itália)",
                "ja-JP": "Japonês (Japão)",
                "jv-ID": "Javanês (Indonésia)",
                "kn-IN": "Canará (Índia)",
                "kk-KZ": "Cazaque (Cazaquistão)",
                "km-KH": "Khmer (Camboja)",
                "ko-KR": "Coreano (Coreia)",
                "lo-LA": "Lao (Laos)",
                "lv-LV": "Letão (Letônia)",
                "lt-LT": "Lituano (Lituânia)",
                "mk-MK": "Macedônio (Macedônia)",
                "ms-MY": "Malaio (Malásia)",
                "ml-IN": "Malaiala (Índia)",
                "mt-MT": "Maltês (Malta)",
                "mr-IN": "Marata (Índia)",
                "mn-MN": "Mongol (Mongólia)",
                "ne-NP": "Nepali (Nepal)",
                "nb-NO": "Norueguês (Noruega)",
                "ps-AF": "Pashto (Afeganistão)",
                "fa-IR": "Persa (Irã)",
                "pl-PL": "Polonês (Polônia)",
                "pt-BR": "Português (Brasil)",
                "pt-PT": "Português (Portugal)",
                "ro-RO": "Romeno (Romênia)",
                "ru-RU": "Russo (Rússia)",
                "sr-RS": "Sérvio (Sérvia)",
                "si-LK": "Cingalês (Sri Lanka)",
                "sk-SK": "Eslovaco (Eslováquia)",
                "sl-SI": "Esloveno (Eslovênia)",
                "so-SO": "Somali (Somália)",
                "es-AR": "Espanhol (Argentina)",
                "es-BO": "Espanhol (Bolívia)",
                "es-CL": "Espanhol (Chile)",
                "es-ES": "Espanhol (Espanha)",
                "es-CO": "Espanhol (Colômbia)",
                "es-CR": "Espanhol (Costa Rica)",
                "es-CU": "Espanhol (Cuba)",
                "es-DO": "Espanhol (República Dominicana)",
                "es-EC": "Espanhol (Equador)",
                "es-SV": "Espanhol (El Salvador)",
                "es-GQ": "Espanhol (Guiné Equatorial)",
                "es-GT": "Espanhol (Guatemala)",
                "es-HN": "Espanhol (Honduras)",
                "es-MX": "Espanhol (México)",
                "es-NI": "Espanhol (Nicarágua)",
                "es-PA": "Espanhol (Panamá)",
                "es-PY": "Espanhol (Paraguai)",
                "es-PE": "Espanhol (Peru)",
                "es-PR": "Espanhol (Porto Rico)",
                "es-US": "Espanhol (Estados Unidos)",
                "es-UY": "Espanhol (Uruguai)",
                "es-VE": "Espanhol (Venezuela)",
                "su-ID": "Sundanês (Indonésia)",
                "sw-KE": "Suaíli (Quênia)",
                "sw-TZ": "Suaíli (Tanzânia)",
                "sv-SE": "Sueco (Suécia)",
                "ta-IN": "Tâmil (Índia)",
                "ta-MY": "Tâmil (Malásia)",
                "ta-SG": "Tâmil (Cingapura)",
                "ta-LK": "Tâmil (Sri Lanka)",
                "te-IN": "Telugu (Índia)",
                "th-TH": "Tailandês (Tailândia)",
                "tr-TR": "Turco (Turquia)",
                "uk-UA": "Ucraniano (Ucrânia)",
                "ur-IN": "Urdu (Índia)",
                "ur-PK": "Urdu (Paquistão)",
                "uz-UZ": "Uzbeque (Uzbequistão)",
                "vi-VN": "Vietnamita (Vietnã)",
                "cy-GB": "Galês (Reino Unido)",
                "zu-ZA": "Zulu (África do Sul)"
              };

            languages.forEach(languageCode => {
                const displayName = languageMap[languageCode] || languageCode;
                const option = $('<option></option>').val(languageCode).text(displayName);
                languageSelect.append(option);
            });

            // Define o idioma padrão
            languageSelect.val("pt-BR");

            // Carrega as vozes para o idioma padrão
            loadVoices("pt-BR");
        },
        error: function() {
            alert('Erro ao carregar os idiomas.');
        }
    });
}

// Função para carregar vozes para um idioma específico
export function loadVoices(languageCode) {
    $.ajax({
        url: `/get-voices?language=${languageCode}`,
        type: 'GET',
        success: function(voices) {
            const voiceSelect = $('#voiceSelect');
            voiceSelect.empty(); // Limpa as opções atuais

            voices.forEach(voice => {
                const option = $('<option></option>').val(voice.ShortName).text(voice.FriendlyName);
                voiceSelect.append(option);
            });

            // Define a primeira voz como padrão
            const firstVoice = voices[0];
            if (firstVoice) {
                voiceSelect.val(firstVoice.ShortName);
                //voiceButton.text(firstVoice.FriendlyName);
            }
        },
        error: function() {
            alert('Erro ao carregar as vozes.');
        }
    });
}

// Evento para carregar as vozes quando o usuário seleciona um idioma
$(document).ready(() => {
    $('#languageSelect').on('change', function() {
        const selectedLanguage = $(this).val();
        loadVoices(selectedLanguage);
    });

    // Carrega os idiomas ao carregar a página
    loadLanguages();
});