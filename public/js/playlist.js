// Função para inicializar o evento de ordenação da playlist
export function initializePlaylistSorting() {
    const sortButton = document.getElementById("sortPlaylistButton");
    const playlistInput = document.getElementById("playlistUrl");

    sortButton.addEventListener("click", () => {
        const playlistUrl = playlistInput.value;

        if (!playlistUrl) {
            alert("Por favor, insira a URL da playlist.");
            return;
        }

        // Redireciona para o endpoint de ordenação da playlist M3U
        window.location.href = `/ordenar?url=${encodeURIComponent(playlistUrl)}`;
    });
}
