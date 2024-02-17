<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verifica se o formulário foi submetido
    $rss_url = $_POST['rss_url'];
    
    // Verifica se a URL do RSS foi fornecida
    if (!empty($rss_url)) {
        // Faz o download do conteúdo do feed RSS
        $rss_content = file_get_contents($rss_url);
        
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
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de Feed RSS</title>
</head>
<body>
    <h1>Gerador de Feed RSS</h1>
    <?php if (isset($error)) { ?>
        <p style="color: red;"><?php echo $error; ?></p>
    <?php } ?>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <label for="rss_url">URL do RSS (XML):</label><br>
        <input type="text" id="rss_url" name="rss_url" size="50"><br><br>
        <input type="submit" value="Gerar Feed RSS">
    </form>
</body>
</html>
