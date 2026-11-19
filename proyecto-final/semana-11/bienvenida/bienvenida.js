/* VISTACONSCIENTE - BIENVENIDA Y CONFIGURACIÓN INICIAL */

document.addEventListener("DOMContentLoaded", () => {
    const CLAVE_CONFIGURACION = "vistaConscienteConfiguracion";

    const interruptorLentes = document.getElementById("usa-lentes");
    if (interruptorLentes) interruptorLentes.checked = false;

    const pantallas = document.querySelectorAll(".pantalla");
    const botonesNavegacion = document.querySelectorAll("[data-ir]");

    function mostrarPantalla(idPantalla) {
        const destino = document.getElementById(idPantalla);
        if (!destino) return;

        pantallas.forEach((pantalla) => {
            const activa = pantalla === destino;
            pantalla.classList.toggle("activa", activa);
            pantalla.hidden = !activa;
            pantalla.setAttribute("aria-hidden", String(!activa));
        });

        window.scrollTo({ top: 0, behavior: "auto" });
    }

    botonesNavegacion.forEach((boton) => {
        boton.addEventListener("click", () => mostrarPantalla(boton.dataset.ir));
    });

    /* Antecedentes visuales: "Ninguno" excluye las demás opciones. */
    const opcionesAntecedentes = document.querySelectorAll('input[name="antecedente"]');
    const opcionNinguno = document.querySelector('input[name="antecedente"][value="ninguno"]');

    opcionesAntecedentes.forEach((opcion) => {
        opcion.addEventListener("change", () => {
            if (opcion.value === "ninguno" && opcion.checked) {
                opcionesAntecedentes.forEach((otra) => {
                    if (otra !== opcion) otra.checked = false;
                });
            } else if (opcion.checked && opcionNinguno) {
                opcionNinguno.checked = false;
            }
        });
    });

    /* Controles de preferencias de descanso. */
    const frecuencia = document.getElementById("frecuencia-descanso");
    const duracion = document.getElementById("duracion-descanso");
    const meta = document.getElementById("meta-diaria");
    const valorFrecuencia = document.getElementById("valor-frecuencia");
    const valorDuracion = document.getElementById("valor-duracion");
    const valorMeta = document.getElementById("valor-meta");
    const textoRecomendacion = document.getElementById("texto-recomendacion");

    const editorTiempo = document.getElementById("editor-tiempo");
    const entradaTiempo = document.getElementById("tiempo-personalizado");
    const guardarTiempo = document.getElementById("guardar-tiempo");
    const cancelarTiempo = document.getElementById("cancelar-tiempo");
    const errorTiempo = document.getElementById("error-tiempo");

    function actualizarRellenoDeslizador(control) {
        const minimo = Number(control.min || 0);
        const maximo = Number(control.max || 100);
        const valor = Number(control.value);
        const porcentaje = maximo > minimo ? ((valor - minimo) / (maximo - minimo)) * 100 : 0;
        control.style.setProperty("--progreso", `${porcentaje}%`);
    }

    function actualizarPreferencias() {
        [frecuencia, duracion, meta].forEach(actualizarRellenoDeslizador);
        const minutosFrecuencia = Number(frecuencia.value);
        const minutosDuracion = Number(duracion.value);
        const cantidadPausas = Number(meta.value);

        valorFrecuencia.textContent = `${minutosFrecuencia} min`;
        valorDuracion.textContent = `${minutosDuracion} min`;
        valorMeta.textContent = `${cantidadPausas} pausas`;

        textoRecomendacion.textContent =
            `Para estudio prolongado sugerimos una pausa de ${minutosDuracion} minutos cada ${minutosFrecuencia} minutos. Tu meta diaria es realizar ${cantidadPausas} pausas.`;
    }

    [frecuencia, duracion, meta].forEach((control) => {
        control.addEventListener("input", actualizarPreferencias);
        control.addEventListener("change", actualizarPreferencias);
    });

    /* Al tocar el valor de frecuencia aparece un campo para escribir minutos. */
    valorFrecuencia.addEventListener("click", () => {
        editorTiempo.hidden = false;
        entradaTiempo.value = frecuencia.value;
        errorTiempo.textContent = "";
        entradaTiempo.focus();
        entradaTiempo.select();
    });

    function cerrarEditor() {
        editorTiempo.hidden = true;
        errorTiempo.textContent = "";
    }

    guardarTiempo.addEventListener("click", () => {
        const valor = entradaTiempo.value.trim();
        const numero = Number(valor);

        if (!/^\d+$/.test(valor) || !Number.isSafeInteger(numero) || numero <= 0 || numero > 120) {
            errorTiempo.textContent = "Escribe un número entero entre 1 y 120.";
            entradaTiempo.focus();
            return;
        }

        frecuencia.value = String(numero);
        actualizarPreferencias();
        cerrarEditor();
    });

    entradaTiempo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") guardarTiempo.click();
        if (evento.key === "Escape") cerrarEditor();
    });

    cancelarTiempo.addEventListener("click", cerrarEditor);

    /* Guarda todas las preferencias para que Inicio pueda recuperarlas. */
    function guardarConfiguracion() {
        const antecedentes = [...opcionesAntecedentes]
            .filter((opcion) => opcion.checked)
            .map((opcion) => opcion.value);

        let configuracionAnterior = {};
        try {
            configuracionAnterior = JSON.parse(localStorage.getItem(CLAVE_CONFIGURACION) || "{}") || {};
        } catch (error) {
            configuracionAnterior = {};
        }

        const configuracion = {
            ...configuracionAnterior,
            usaLentes: document.getElementById("usa-lentes").checked,
            antecedentesVisuales: antecedentes,
            minutosEntrePausas: Number(frecuencia.value),
            duracionSesion: Number(frecuencia.value),
            duracionPausa: Number(duracion.value),
            metaDiaria: Number(meta.value)
        };

        localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(configuracion));
    }

    const botonFinalizar = document.querySelector(".boton-finalizar");
    if (botonFinalizar) {
        botonFinalizar.addEventListener("click", guardarConfiguracion);
    }

    /* Si el usuario ya tiene perfil, se conservan los datos guardados.
       Si no existen, Inicio utilizará sus valores predeterminados. */

    actualizarPreferencias();
    mostrarPantalla("pantalla-bienvenida");
});
