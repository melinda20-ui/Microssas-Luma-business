(() => {

    async function criarMascaraPrata() {

        try {

            const response = await fetch(
                "/data/site.json?t=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) return;

            const config = await response.json();

            const src =
                config?.hero?.maskImage;

            const ornament =
                document.querySelector(".ornament");

            if (!src || !ornament) return;


            /*
             * Remove completamente o conteúdo antigo:
             * losango, mini-mask etc.
             */
            ornament.innerHTML = "";


            const img =
                document.createElement("img");

            img.src = src;

            img.alt = "";

            img.className =
                "silver-mask-icon";

            ornament.appendChild(img);

        }

        catch (error) {

            console.error(
                "Erro mini máscara prata:",
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
            criarMascaraPrata
        );

    }

    else {

        criarMascaraPrata();

    }

})();
