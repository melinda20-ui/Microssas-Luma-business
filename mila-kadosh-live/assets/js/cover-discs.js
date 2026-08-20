(() => {

    const CONFIG = [
        { selector: ".cover-1", color: "gold",   side: "left"  },
        { selector: ".cover-2", color: "red",    side: "right" },
        { selector: ".cover-3", color: "silver", side: "right" },

        { selector: ".cover-4", color: "rose",   side: "left"  },
        { selector: ".cover-5", color: "silver", side: "right" },

        { selector: ".cover-6", color: "gold",   side: "left"  },
        { selector: ".cover-7", color: "red",    side: "right" },

        { selector: ".cover-8", color: "silver", side: "left"  },
        { selector: ".cover-9", color: "rose",   side: "right" }
    ];


    function limparVersoesAntigas() {

        const antigos = document.querySelectorAll(`
            .cover-disc,
            .cover-disc-v4,
            .cover-disc-v5,
            .cover-disc-v6,
            .mk-cover-disc,
            .mk-cover-disc-v4,
            .mk-cover-disc-v5,
            .mk-cover-disc-v6,
            .mk-cover-disc-v7,
            .disc-overlay,
            .cover-disc-overlay,
            [data-cover-disc]
        `);

        antigos.forEach(el => el.remove());
    }


    function criarDisc(color, side) {

        const disc = document.createElement("div");

        disc.className =
            `mk-cover-disc-v7 mk-disc-${color} mk-disc-${side}`;

        disc.dataset.coverDisc = "true";

        disc.innerHTML = `
            <span class="mk-disc-hole"></span>
        `;

        return disc;
    }


    function montar() {

        limparVersoesAntigas();

        CONFIG.forEach(item => {

            const cover = document.querySelector(item.selector);

            if (!cover) return;

            const disc = criarDisc(
                item.color,
                item.side
            );

            /*
             O CD entra DENTRO da própria capa no DOM.
             Por isso nunca mais fica voando pela tela.
            */
            cover.appendChild(disc);
        });
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            montar
        );

    } else {

        montar();
    }


    window.addEventListener("load", () => {

        setTimeout(montar, 100);
        setTimeout(montar, 700);

    });

})();
