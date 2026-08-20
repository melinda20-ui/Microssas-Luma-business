(() => {

    const DESKTOP_MIN = 900;

    function resetExperience(exp) {
        exp.style.position = "";
        exp.style.top = "";
        exp.style.left = "";
        exp.style.right = "";
        exp.style.margin = "";
        exp.style.transform = "";
        exp.style.transformOrigin = "";
    }

    function fitDesktop() {

        const exp = document.querySelector(".experience");

        if (!exp) return;

        /*
         MOBILE:
         remove qualquer ajuste e sai imediatamente.
         Portanto o celular permanece como já está.
        */
        if (window.innerWidth < DESKTOP_MIN) {
            resetExperience(exp);
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            return;
        }

        /*
         Primeiro volta ao tamanho natural para medir.
        */
        resetExperience(exp);

        exp.style.position = "relative";
        exp.style.margin = "0 auto";

        /*
         Força leitura do layout natural completo.
        */
        const naturalWidth = Math.max(
            exp.scrollWidth,
            exp.getBoundingClientRect().width
        );

        const naturalHeight = Math.max(
            exp.scrollHeight,
            exp.getBoundingClientRect().height
        );

        /*
         Pequena margem para nunca cortar
         o último pixel no Chrome.
        */
        const availableWidth = window.innerWidth - 18;
        const availableHeight = window.innerHeight - 8;

        const scaleWidth =
            naturalWidth > 0
                ? availableWidth / naturalWidth
                : 1;

        const scaleHeight =
            naturalHeight > 0
                ? availableHeight / naturalHeight
                : 1;

        /*
         Nunca aumenta.
         Apenas diminui o necessário.
        */
        let scale = Math.min(
            1,
            scaleWidth,
            scaleHeight
        );

        /*
         Proteção contra valores inesperados.
        */
        if (!Number.isFinite(scale) || scale <= 0) {
            scale = 1;
        }

        /*
         Centraliza a página inteira no computador.
        */
        exp.style.position = "fixed";
        exp.style.top = "4px";
        exp.style.left = "50%";
        exp.style.margin = "0";
        exp.style.transformOrigin = "top center";
        exp.style.transform =
            `translateX(-50%) scale(${scale})`;

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
    }


    /*
     Recalcula após imagens, fontes e resize.
    */
    function scheduleFit() {
        requestAnimationFrame(() => {
            requestAnimationFrame(fitDesktop);
        });
    }


    document.addEventListener(
        "DOMContentLoaded",
        scheduleFit
    );

    window.addEventListener(
        "load",
        scheduleFit
    );

    window.addEventListener(
        "resize",
        scheduleFit
    );


    /*
     Espera as fontes carregarem.
    */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleFit);
    }


    /*
     Recalcula mais algumas vezes porque
     as capas/imagens podem carregar depois.
    */
    setTimeout(scheduleFit, 250);
    setTimeout(scheduleFit, 800);
    setTimeout(scheduleFit, 1600);

})();
