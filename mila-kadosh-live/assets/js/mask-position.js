(() => {

    async function applyMaskPosition() {

        try {

            const response =
                await fetch(
                    `/data/site.json?t=${Date.now()}`,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                return;

            }


            const config =
                await response.json();


            const position =
                config.maskPosition;


            if (
                !position
            ) {

                return;

            }


            const mask =
                document.getElementById(
                    "maskImage"
                );


            if (
                !mask
            ) {

                return;

            }


            const x =
                Number(
                    position.x
                );


            const y =
                Number(
                    position.y
                );


            const scale =
                Number(
                    position.scale
                );


            const rotation =
                Number(
                    position.rotation ||
                    0
                );


            if (
                !Number.isFinite(x) ||
                !Number.isFinite(y) ||
                !Number.isFinite(scale) ||
                !Number.isFinite(rotation)
            ) {

                return;

            }


            /*
               IMPORTANTE:

               usamos inline !important
               para vencer os vários
               microajustes antigos
               presentes no CSS.
            */

            mask.style.setProperty(
                "left",
                `${x}%`,
                "important"
            );


            mask.style.setProperty(
                "top",
                `${y}%`,
                "important"
            );


            mask.style.setProperty(
                "width",
                `${scale}%`,
                "important"
            );


            mask.style.setProperty(
                "height",
                "auto",
                "important"
            );


            mask.style.setProperty(
                "transform",
                `translate(-50%, -50%) rotate(${rotation}deg)`,
                "important"
            );


            mask.style.setProperty(
                "transform-origin",
                "center center",
                "important"
            );


            window.dispatchEvent(
                new CustomEvent(
                    "mila:mask-position-ready",
                    {
                        detail:
                            {
                                x,
                                y,
                                scale,
                                rotation
                            }
                    }
                )
            );

        }

        catch (error) {

            console.error(
                "Erro ao aplicar posição da máscara:",
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
            applyMaskPosition
        );

    }

    else {

        applyMaskPosition();

    }

})();
