(() => {

    const TARGETS = {
        cover1: [".cover-1"],
        cover2: [".cover-2"],
        cover3: [".cover-3"],
        cover4: [".cover-4"],
        cover5: [".cover-5"],
        cover6: [".cover-6"],
        cover7: [".cover-7"],
        cover8: [".cover-8"],
        cover9: [".cover-9"],

        artist: [
            ".artist-stage"
        ],

        mask: [
            "#maskImage",
            ".mask-image"
        ],

        cta: [
            ".interaction"
        ],

        album: [
            ".falling-album",
            ".album-falling-mockup",
            ".falling-album-mockup",
            ".album-mockup",
            "[data-falling-album]"
        ]
    };

    let lastLayout = null;

    function findElement(key) {
        const selectors = TARGETS[key] || [];

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) return el;
        }

        return null;
    }

    function applyItem(key, config) {

        const el = findElement(key);
        if (!el) return;

        const x = Number(config?.x || 0);
        const y = Number(config?.y || 0);
        const scale = Number(config?.scale || 1);

        /*
          Usa propriedades transform independentes.
          Isso PRESERVA transforms antigos como translateX(-50%).
        */

        el.style.setProperty(
            "translate",
            `${x}vw ${y}vh`,
            "important"
        );

        el.style.setProperty(
            "scale",
            `${scale}`,
            "important"
        );
    }

    function applyLayout(layout) {

        if (!window.matchMedia("(min-width: 900px)").matches) {
            return;
        }

        lastLayout = layout;

        const desktop = layout?.desktop || {};

        Object.entries(desktop).forEach(([key, config]) => {
            applyItem(key, config);
        });
    }

    async function loadLayout() {

        if (!window.matchMedia("(min-width: 900px)").matches) {
            return;
        }

        try {

            const response = await fetch(
                `/data/layout.json?v=${Date.now()}`,
                { cache: "no-store" }
            );

            if (!response.ok) return;

            const layout = await response.json();

            applyLayout(layout);

            /*
              Repete porque algumas imagens/álbum
              são inseridos depois por outros scripts.
            */

            setTimeout(() => applyLayout(layout), 250);
            setTimeout(() => applyLayout(layout), 800);
            setTimeout(() => applyLayout(layout), 1600);

        } catch (error) {
            console.warn("Layout desktop não carregado:", error);
        }
    }

    window.__MILA_LAYOUT_TARGETS = TARGETS;
    window.__MILA_APPLY_LAYOUT = applyLayout;
    window.__MILA_LOAD_LAYOUT = loadLayout;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadLayout);
    } else {
        loadLayout();
    }

    window.addEventListener("load", loadLayout);

})();
