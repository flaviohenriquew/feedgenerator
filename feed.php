<?php
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Obtém a URL do feed RSS da consulta
    $rss_url = $_GET['url'];

    // Verifica se a URL do RSS foi fornecida
    if (!empty($rss_url)) {
        // Faz o download do conteúdo do feed RSS
        $rss_content = file_get_contents($rss_url, false, stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]));
        
        // Verifica se o conteúdo foi baixado com sucesso
        if ($rss_content !== false) {
            // Define o cabeçalho como XML para indicar que estamos gerando um feed RSS
            header('Content-Type: application/rss+xml; charset=utf-8');
            
            // Imprime o conteúdo do feed RSS
            echo $rss_content;
            exit;
        } else {
            $error = "Não foi possível baixar o feed RSS. Verifique se a URL está correta e tente novamente.";
        }
    } else {
        $error = "Por favor, insira a URL do feed RSS.";
    }
}

// Se chegou aqui, houve um erro
echo "<p style='color: red;'>$error</p>";
?>
