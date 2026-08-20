(() => {

    function colocarAlbumNoVestido() {

        const album =
            document.querySelector(".falling-album");

        const stage =
            document.querySelector(".artist-stage");

        if (!album || !stage) {
            return;
        }

        if (album.parentElement !== stage) {
            stage.appendChild(album);
        }

        album.classList.add(
            "album-pendurado"
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            colocarAlbumNoVestido
        );

    }

    else {

        colocarAlbumNoVestido();

    }


    window.addEventListener(
        "load",
        colocarAlbumNoVestido
    );

})();
