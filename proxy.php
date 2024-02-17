<?php
// Verifica se a URL do feed RSS foi fornecida como parâmetro
if (isset($_GET['url'])) {
    // Obtém a URL do feed RSS
    $rss_url = $_GET['url'];

    // Faz a solicitação para o feed RSS
    $rss_content = file_get_contents($rss_url);

    // Verifica se o conteúdo foi baixado com sucesso
    if ($rss_content !== false) {
        // Define o cabeçalho como XML para indicar que estamos gerando um feed RSS
        header('Content-Type: application/rss+xml; charset=utf-8');

        // Imprime o conteúdo do feed RSS
        echo $rss_content;
        exit;
    } else {
        // Se houver um erro ao baixar o conteúdo do feed RSS, retorna uma mensagem de erro
        http_response_code(500);
        echo "Erro ao baixar o feed RSS.";
    }
} else {
    // Se a URL do feed RSS não foi fornecida como parâmetro, retorna uma mensagem de erro
    http_response_code(400);
    echo "URL do feed RSS não especificada.";
}
?>
