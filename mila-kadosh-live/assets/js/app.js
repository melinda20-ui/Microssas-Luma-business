const CONFIG_URL = "/data/site.json";


async function loadSite() {

    try {

        const response = await fetch(
            CONFIG_URL,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Não foi possível carregar site.json"
            );

        }


        const data = await response.json();


        renderBrand(data);

        renderHero(data);

        renderCovers(data);

        renderCTA(data);

        renderSocial(data);


    } catch (error) {

        console.error(
            "Erro carregando configuração:",
            error
        );

    }

}


function renderBrand(data) {

    if (!data.brand) return;


    document.getElementById(
        "brandName"
    ).textContent =
        data.brand.name ||
        "MILA KADOSH";


    document.getElementById(
        "brandSubtitle"
    ).textContent =
        data.brand.subtitle ||
        "";

}


function renderHero(data) {

    const artist =
        document.getElementById(
            "artistPhoto"
        );


    const placeholder =
        document.getElementById(
            "artistPlaceholder"
        );


    const mask =
        document.getElementById(
            "maskImage"
        );


    if (
        data.hero &&
        data.hero.artistImage
    ) {

        artist.src =
            data.hero.artistImage;

        artist.style.display =
            "block";

        placeholder.style.display =
            "none";

    }


    if (
        data.hero &&
        data.hero.maskImage
    ) {

        mask.src =
            data.hero.maskImage;

        mask.style.display =
            "block";

    }

}


function renderCovers(data) {

    if (!Array.isArray(data.covers)) {
        return;
    }


    const cards =
        document.querySelectorAll(
            ".cover"
        );


    cards.forEach(
        (card, index) => {

            const cover =
                data.covers[index];


            if (!cover) return;


            const title =
                card.querySelector(
                    "span"
                );


            const image =
                card.querySelector(
                    ".cover-image"
                );


            title.textContent =
                cover.title ||
                `capa ${index + 1}`;


            if (cover.image) {

                image.style.backgroundImage =
                    `url("${cover.image}")`;

            }

        }
    );

}


function renderCTA(data) {

    if (!data.cta) return;


    const button =
        document.getElementById(
            "dropMaskButton"
        );


    const subtitle =
        document.getElementById(
            "ctaSubtitle"
        );


    button.textContent =
        data.cta.title ||
        "deixe a máscara cair";


    subtitle.textContent =
        data.cta.subtitle ||
        "";

}


function renderSocial(data) {

    if (!data.social) return;


    document
        .querySelectorAll(
            "[data-social]"
        )
        .forEach(link => {

            const network =
                link.dataset.social;


            const url =
                data.social[network];


            if (url) {

                link.href = url;

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

            } else {

                link.addEventListener(
                    "click",
                    event =>
                        event.preventDefault()
                );

            }

        });

}


/*
==========================================
BOTÃO PRINCIPAL

Por enquanto NÃO troca de página.

Na próxima etapa este evento vai iniciar:

1. máscara sai do rosto
2. máscara cai
3. fundo começa a derreter
4. interface desaparece
5. abre a segunda cena
==========================================
*/

document
    .getElementById(
        "dropMaskButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "dropMaskButton"
                )
                .classList
                .add("pressed");

        }
    );


loadSite();
