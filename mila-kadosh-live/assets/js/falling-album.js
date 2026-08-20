(() => {

    async function loadFallingAlbum() {

        try {

            const response =
                await fetch(
                    "/data/site.json?t=" + Date.now(),
                    {
                        cache:
                            "no-store"
                    }
                );

            if (!response.ok) return;

            const config =
                await response.json();


            const image =
                config?.fallingAlbum?.image;


            if (!image) return;


            const cover =
                document.getElementById(
                    "fallingAlbumCover"
                );


            const placeholder =
                document.getElementById(
                    "fallingAlbumPlaceholder"
                );


            if (!cover) return;


            cover.src =
                image;


            cover.onload =
                () => {

                    cover.style.display =
                        "block";

                    if (placeholder) {

                        placeholder.style.display =
                            "none";

                    }

                };

        }

        catch (error) {

            console.error(
                "Falling album:",
                error
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadFallingAlbum
        );

    }

    else {

        loadFallingAlbum();

    }

})();
