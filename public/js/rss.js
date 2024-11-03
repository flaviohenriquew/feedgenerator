// Função para inicializar o fetch do RSS e exibir o cabeçalho Referer
export function initializeRSSFetch() {
    fetch("https://feedgenerator.tech/rss?url=https://bj-share.info/feed.php?u:184515;f;c:1;l;h:3f9d0d45&keyword=Dual")
        .then((response) => {
            const referer = response.headers.get("X-Referer");
            console.log("Referer:", referer);
            return response.text();
        })
        .catch((error) => console.error("Ocorreu um erro:", error));
}
