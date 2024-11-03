// Função para carregar categorias e personalidades como botões de alternância
export function loadVoiceEffects() {
    $.ajax({
        url: '/get-voice-effects',
        type: 'GET',
        success: function(data) {
            const { categories, personalities } = data;

            // Preenchendo as categorias como botões de alternância
            const categoryContainer = $('#categoryContainer');
            categoryContainer.empty();
            categories.forEach((category) => {
                const button = $('<div>')
                    .addClass('toggle-button')
                    .text(category)
                    .click(function() {
                        // Remover a classe 'active' de todos os outros botões na categoria
                        categoryContainer.find('.toggle-button').removeClass('active');
                        // Adicionar a classe 'active' ao botão selecionado
                        $(this).addClass('active');
                    })
                    .attr('data-category', category); // Armazena o valor da categoria como atributo

                categoryContainer.append(button);
            });

            // Preenchendo as personalidades como botões de alternância
            const personalityContainer = $('#personalityContainer');
            personalityContainer.empty();
            personalities.forEach((personality) => {
                const button = $('<div>')
                    .addClass('toggle-button')
                    .text(personality)
                    .click(function() {
                        // Remover a classe 'active' de todos os outros botões na personalidade
                        personalityContainer.find('.toggle-button').removeClass('active');
                        // Adicionar a classe 'active' ao botão selecionado
                        $(this).addClass('active');
                    })
                    .attr('data-personality', personality); // Armazena o valor da personalidade como atributo

                personalityContainer.append(button);
            });
        },
        error: function() {
            alert('Erro ao carregar os efeitos de voz.');
        }
    });
}
