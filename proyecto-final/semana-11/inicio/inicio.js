/* VISTACONSCIENTE - INICIO Y CONTROL DE SESIONES */
document.addEventListener("DOMContentLoaded", () => {
    const CLAVE_CONFIGURACION = "vistaConscienteConfiguracion";
    const configuracionPredeterminada = {
        usaLentes: false, antecedentesVisuales: [], minutosEntrePausas: 45,
        duracionSesion: 45, duracionPausa: 5, metaDiaria: 5
    };
    let configuracion = { ...configuracionPredeterminada };
    try {
        const guardada = JSON.parse(localStorage.getItem(CLAVE_CONFIGURACION) || "null");
        if (guardada && typeof guardada === "object") configuracion = { ...configuracionPredeterminada, ...guardada };
    } catch (error) { console.warn("No se pudo recuperar la configuración guardada.", error); }

    function leerFrecuenciaGuardada() {
        const valor = Number(configuracion.duracionSesion ?? configuracion.minutosEntrePausas);
        const minutos = Number.isInteger(valor) ? Math.min(120, Math.max(1, valor)) : 45;
        configuracion.minutosEntrePausas = minutos;
        configuracion.duracionSesion = minutos;
        return minutos;
    }
    function guardarFrecuencia(minutos) {
        let actual = {};
        try { actual = JSON.parse(localStorage.getItem(CLAVE_CONFIGURACION) || "{}") || {}; } catch (_) {}
        configuracion = { ...configuracionPredeterminada, ...actual, minutosEntrePausas: minutos, duracionSesion: minutos };
        localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(configuracion));
        window.vistaConscienteConfig = configuracion;
    }
    window.vistaConscienteConfig = configuracion;

    const botonesActividad = document.querySelectorAll(".opcion-actividad");
    const preparacion = document.getElementById("preparacion-sesion");
    const panelActivo = document.getElementById("panel-sesion-activa");
    const botonIniciar = document.getElementById("boton-sesion");
    const botonPausar = document.getElementById("pausar-sesion");
    const botonReanudarDescanso = document.getElementById("reanudar-descanso");
    const botonIniciarPausa = document.getElementById("iniciar-pausa");
    const botonAccionFinDescanso = document.getElementById("accion-fin-descanso");
    const botonFinalizar = document.getElementById("finalizar-sesion");
    const estadoGlobal = document.getElementById("texto-estado-global");
    const estadoSesionTexto = document.getElementById("estado-sesion-texto");
    const duracionSesion = document.getElementById("duracion-sesion");
    const cuentaPausa = document.getElementById("cuenta-pausa");

    const modal = document.getElementById("modal-duracion-sesion");
    const textoDuracionGuardada = document.getElementById("duracion-guardada");
    const inputDuracion = document.getElementById("nueva-duracion-sesion");
    const errorDuracion = document.getElementById("error-duracion-sesion");
    const confirmarDuracion = document.getElementById("confirmar-modal-duracion");
    const modalFinalizar = document.getElementById("modal-confirmar-finalizacion");
    const modalMolestia = document.getElementById("modal-registrar-molestia");

    let actividadSeleccionada = "Estudio";
    let estadoSesion = "inactiva"; // inactiva | activa | pausada | descanso | descanso-pausado | descanso-terminado
    let segundosSesion = 0;
    let segundosHastaPausa = leerFrecuenciaGuardada() * 60;
    let segundosDescanso = Number(configuracion.duracionPausa) * 60;
    let pausaPendiente = false;
    let origenPausa = "manual"; // manual | automatica
    let intervalo = null;
    const fechaHoy = new Date().toLocaleDateString("en-CA");
    const CLAVE_PAUSAS = `vistaConscientePausas_v2_${fechaHoy}`;
    let pausasContadas = Number(localStorage.getItem(CLAVE_PAUSAS) || 0);
    if (!Number.isFinite(pausasContadas) || pausasContadas < 0) pausasContadas = 0;

    function actualizarProgresoPausas() {
        const meta = Math.max(1, Number(configuracion.metaDiaria) || 1);
        const porcentaje = Math.min(100, Math.round((pausasContadas / meta) * 100));
        const anillo = document.getElementById("anillo-progreso");
        const textoCircular = document.getElementById("porcentaje-circular");
        const textoPausas = document.getElementById("texto-pausas-completadas");
        const numeroMeta = document.getElementById("numero-meta-pausas");
        const textoPorcentaje = document.getElementById("porcentaje-cumplimiento");
        const barra = document.getElementById("barra-progreso-cumplimiento");
        if (anillo) anillo.style.setProperty("--progreso", `${porcentaje}%`);
        if (textoCircular) textoCircular.textContent = `${porcentaje}%`;
        if (textoPausas) textoPausas.textContent = `${pausasContadas} de ${meta} completadas`;
        if (numeroMeta) numeroMeta.textContent = String(meta);
        if (textoPorcentaje) textoPorcentaje.textContent = `${porcentaje}%`;
        if (barra) barra.style.width = `${porcentaje}%`;
    }
    function registrarPausaIniciada() {
        pausasContadas++;
        localStorage.setItem(CLAVE_PAUSAS, String(pausasContadas));
        actualizarProgresoPausas();
    }
    function restaurarTituloPestana() {
        document.title = "VistaConsciente | Inicio";
    }
    window.addEventListener("focus", restaurarTituloPestana);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) restaurarTituloPestana();
    });

    function formatoTiempo(segundos) {
        const valor = Math.max(0, Math.floor(segundos));
        return `${String(Math.floor(valor / 60)).padStart(2, "0")}:${String(valor % 60).padStart(2, "0")}`;
    }
    function sonarCampanilla() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audio = new AudioContext();
            if (audio.state === "suspended") audio.resume();
            [880, 1174.66].forEach((frecuencia, indice) => {
                const oscilador = audio.createOscillator(); const ganancia = audio.createGain();
                oscilador.type = "sine"; oscilador.frequency.value = frecuencia;
                ganancia.gain.setValueAtTime(0.0001, audio.currentTime + indice * 0.16);
                ganancia.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + indice * 0.16 + 0.025);
                ganancia.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + indice * 0.16 + 0.42);
                oscilador.connect(ganancia); ganancia.connect(audio.destination);
                oscilador.start(audio.currentTime + indice * 0.16); oscilador.stop(audio.currentTime + indice * 0.16 + 0.45);
            });
            setTimeout(() => audio.close(), 1000);
        } catch (error) { console.warn("No se pudo reproducir el aviso.", error); }
    }
    function mostrarModal(elemento) {
        elemento.hidden = false; elemento.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-abierto");
    }
    function ocultarModal(elemento) {
        elemento.hidden = true; elemento.setAttribute("aria-hidden", "true");
        if (modal.hidden && modalFinalizar.hidden && modalMolestia.hidden) document.body.classList.remove("modal-abierto");
    }
    function abrirModalDuracion() {
        const minutos = leerFrecuenciaGuardada();
        textoDuracionGuardada.textContent = `${minutos} min`;
        inputDuracion.value = String(minutos); errorDuracion.textContent = "";
        mostrarModal(modal); inputDuracion.focus(); inputDuracion.select();
    }
    function cerrarModalDuracion() { ocultarModal(modal); }
    function confirmarInicioSesion() {
        const minutos = inputDuracion.valueAsNumber;
        if (!Number.isInteger(minutos) || minutos < 1 || minutos > 120) {
            errorDuracion.textContent = "Introduce un número entero entre 1 y 120 minutos.";
            inputDuracion.focus(); return;
        }
        guardarFrecuencia(minutos);
        segundosHastaPausa = minutos * 60;
        cerrarModalDuracion();
        iniciarSesion();
    }
    function actualizarEstadoGlobal() {
        if (estadoSesion === "activa") estadoGlobal.textContent = `Sesión activa · ${formatoTiempo(segundosSesion)}`;
        else if (estadoSesion === "pausada") estadoGlobal.textContent = `Sesión pausada · ${formatoTiempo(segundosSesion)}`;
        else if (estadoSesion.startsWith("descanso")) estadoGlobal.textContent = `Pausa · ${formatoTiempo(segundosSesion)}`;
        else estadoGlobal.textContent = "Sin sesión activa";
    }
    function actualizarInterfazSesion() {
        const enCurso = estadoSesion !== "inactiva";
        preparacion.hidden = enCurso; panelActivo.hidden = !enCurso;
        if (!enCurso) { estadoGlobal.textContent = "Sin sesión activa"; return; }
        duracionSesion.textContent = formatoTiempo(segundosSesion);
        actualizarEstadoGlobal();
        // Cuando termina la cuenta para iniciar una pausa, no se permite pausar
        // el temporizador en ese instante; la acción de continuar sigue disponible.
        botonPausar.disabled = estadoSesion === "activa" && segundosHastaPausa <= 0;
        const enDescanso = estadoSesion.startsWith("descanso");
        botonPausar.hidden = enDescanso;
        botonReanudarDescanso.hidden = !enDescanso;
        botonIniciarPausa.hidden = enDescanso;
        botonAccionFinDescanso.hidden = !enDescanso;
        if (estadoSesion === "activa") {
            estadoSesionTexto.textContent = `${actividadSeleccionada.toUpperCase()} EN CURSO`;
            botonPausar.innerHTML = '<span class="material-symbols-outlined">pause</span><span>Pausar</span>';
            cuentaPausa.textContent = formatoTiempo(segundosHastaPausa);
        } else if (estadoSesion === "pausada") {
            estadoSesionTexto.textContent = "SESIÓN PAUSADA";
            botonPausar.innerHTML = '<span class="material-symbols-outlined">play_arrow</span><span>Continuar</span>';
            cuentaPausa.textContent = formatoTiempo(segundosHastaPausa);
        } else if (estadoSesion === "descanso") {
            estadoSesionTexto.textContent = "PAUSA EN CURSO";
            botonReanudarDescanso.innerHTML = '<span class="material-symbols-outlined">pause</span><span>Pausar</span>';
            cuentaPausa.textContent = formatoTiempo(segundosDescanso);
            configurarAccionFinDescanso();
        } else if (estadoSesion === "descanso-pausado") {
            estadoSesionTexto.textContent = "PAUSA DETENIDA";
            botonReanudarDescanso.innerHTML = '<span class="material-symbols-outlined">play_arrow</span><span>Continuar pausa</span>';
            cuentaPausa.textContent = formatoTiempo(segundosDescanso);
            configurarAccionFinDescanso();
        } else if (estadoSesion === "descanso-terminado") {
            estadoSesionTexto.textContent = "PAUSA COMPLETADA";
            botonReanudarDescanso.hidden = true;
            cuentaPausa.textContent = "00:00";
            configurarAccionFinDescanso();
        }
    }
    function configurarAccionFinDescanso() {
        const automatica = origenPausa === "automatica";
        botonAccionFinDescanso.innerHTML = automatica
            ? '<span class="material-symbols-outlined">play_arrow</span><span>Iniciar sesión</span>'
            : '<span class="material-symbols-outlined">play_arrow</span><span>Continuar sesión</span>';
    }
    function detenerReloj() { if (intervalo !== null) { clearInterval(intervalo); intervalo = null; } }
    function iniciarReloj() {
        detenerReloj();
        intervalo = setInterval(() => {
            if (estadoSesion === "activa") {
                segundosSesion++;
                if (segundosHastaPausa > 0) segundosHastaPausa--;
                if (segundosHastaPausa === 0 && !pausaPendiente) {
                    pausaPendiente = true;
                    document.title = "¡Terminó el tiempo de la sesión! | VistaConsciente";
                    sonarCampanilla();
                }
            } else if (estadoSesion === "descanso") {
                segundosSesion++; segundosDescanso--;
                if (segundosDescanso <= 0) {
                    segundosDescanso = 0;
                    estadoSesion = "descanso-terminado";
                    document.title = "¡Terminó el tiempo de la pausa! | VistaConsciente";
                    sonarCampanilla();
                }
            }
            actualizarInterfazSesion();
        }, 1000);
    }
    function iniciarDescansoManual() {
        if (estadoSesion !== "activa" && estadoSesion !== "pausada") return;
        origenPausa = pausaPendiente ? "automatica" : "manual";
        estadoSesion = "descanso";
        registrarPausaIniciada();
        segundosDescanso = Number(configuracion.duracionPausa) * 60;
        actualizarInterfazSesion();
        iniciarReloj();
    }
    function pausarOContinuarSesion() {
        if (estadoSesion === "activa" && segundosHastaPausa <= 0) return;
        if (estadoSesion === "activa") estadoSesion = "pausada";
        else if (estadoSesion === "pausada") estadoSesion = "activa";
        actualizarInterfazSesion();
    }
    function pausarOReanudarDescanso() {
        if (estadoSesion === "descanso") estadoSesion = "descanso-pausado";
        else if (estadoSesion === "descanso-pausado") estadoSesion = "descanso";
        actualizarInterfazSesion();
    }
    function continuarSesionTrasDescanso() {
        if (origenPausa === "automatica") { abrirModalDuracion(); return; }
        document.title = "VistaConsciente | Inicio";
        estadoSesion = "activa";
        actualizarInterfazSesion();
        iniciarReloj();
    }
    function iniciarSesion() {
        document.title = "VistaConsciente | Inicio";
        estadoSesion = "activa"; segundosSesion = 0;
        segundosHastaPausa = Number(configuracion.duracionSesion || configuracion.minutosEntrePausas) * 60;
        segundosDescanso = Number(configuracion.duracionPausa) * 60;
        pausaPendiente = false;
        actualizarInterfazSesion(); iniciarReloj();
    }
    function finalizarSesion() {
        document.title = "VistaConsciente | Inicio";
        detenerReloj(); estadoSesion = "inactiva"; segundosSesion = 0;
        segundosHastaPausa = Number(configuracion.duracionSesion || configuracion.minutosEntrePausas) * 60;
        segundosDescanso = Number(configuracion.duracionPausa) * 60; pausaPendiente = false;
        ocultarModal(modalFinalizar); actualizarInterfazSesion();
    }

    botonesActividad.forEach((boton) => boton.addEventListener("click", () => {
        if (estadoSesion !== "inactiva") return;
        botonesActividad.forEach((opcion) => opcion.classList.remove("activa"));
        boton.classList.add("activa"); actividadSeleccionada = boton.dataset.actividad;
        document.getElementById("ayuda-concentracion").textContent = actividadSeleccionada === "Trabajo" ? "Avisos discretos, sin interrupciones" : "Avisos discretos";
        document.getElementById("ayuda-carga").textContent = actividadSeleccionada === "Trabajo" ? "Pausas y consejos reforzados" : "Pausas reforzadas";
        document.getElementById("texto-boton-sesion").textContent = `Iniciar sesión de ${actividadSeleccionada}`;
    }));
    // Registro rápido de molestias visuales.
    const botonAbrirMolestia = document.getElementById("abrir-modal-molestia");
    const botonGuardarMolestia = document.getElementById("guardar-modal-molestia");
    const intensidadMolestia = document.getElementById("intensidad-molestia");
    const valorIntensidadMolestia = document.getElementById("valor-intensidad-molestia");
    const actividadMolestia = document.getElementById("actividad-molestia");
    const errorMolestia = document.getElementById("error-molestia");
    const opcionesMolestia = [...document.querySelectorAll(".opcion-molestia")];
    function actualizarSeleccionMolestias() {
        const seleccionadas = opcionesMolestia.filter((opcion) => opcion.getAttribute("aria-pressed") === "true");
        botonGuardarMolestia.disabled = seleccionadas.length === 0;
        errorMolestia.textContent = "";
    }
    botonAbrirMolestia.addEventListener("click", () => {
        actividadMolestia.textContent = actividadSeleccionada;
        errorMolestia.textContent = "";
        mostrarModal(modalMolestia);
    });
    opcionesMolestia.forEach((opcion) => opcion.addEventListener("click", () => {
        const seleccionado = opcion.getAttribute("aria-pressed") === "true";
        opcion.setAttribute("aria-pressed", String(!seleccionado));
        actualizarSeleccionMolestias();
    }));
    intensidadMolestia.addEventListener("input", () => { valorIntensidadMolestia.textContent = `${intensidadMolestia.value} / 10`; });
    function cerrarModalMolestia() { ocultarModal(modalMolestia); }
    document.getElementById("cancelar-modal-molestia").addEventListener("click", cerrarModalMolestia);
    modalMolestia.addEventListener("click", (evento) => { if (evento.target === modalMolestia) cerrarModalMolestia(); });
    botonGuardarMolestia.addEventListener("click", () => {
        const molestias = opcionesMolestia.filter((opcion) => opcion.getAttribute("aria-pressed") === "true").map((opcion) => opcion.textContent.trim());
        if (!molestias.length) { errorMolestia.textContent = "Selecciona al menos una molestia."; return; }
        const claveRegistros = "vistaConscienteRegistrosMolestias";
        let registros = [];
        try { registros = JSON.parse(localStorage.getItem(claveRegistros) || "[]"); if (!Array.isArray(registros)) registros = []; } catch (_) { registros = []; }
        registros.push({ molestias, intensidad: Number(intensidadMolestia.value), actividad: actividadSeleccionada, fechaHora: new Date().toISOString(), sesionActiva: estadoSesion !== "inactiva" });
        localStorage.setItem(claveRegistros, JSON.stringify(registros));
        opcionesMolestia.forEach((opcion) => opcion.setAttribute("aria-pressed", "false"));
        intensidadMolestia.value = "3"; valorIntensidadMolestia.textContent = "3 / 10";
        actualizarSeleccionMolestias(); cerrarModalMolestia();
    });

    botonIniciar.addEventListener("click", abrirModalDuracion);
    confirmarDuracion.addEventListener("click", confirmarInicioSesion);
    document.getElementById("cancelar-modal-duracion").addEventListener("click", cerrarModalDuracion);
    document.getElementById("cerrar-modal-duracion").addEventListener("click", cerrarModalDuracion);
    modal.addEventListener("click", (evento) => { if (evento.target === modal) cerrarModalDuracion(); });
    inputDuracion.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") confirmarInicioSesion();
        if (evento.key === "Escape") { cerrarModalDuracion(); cerrarModalMolestia(); ocultarModal(modalFinalizar); }
    });
    botonPausar.addEventListener("click", pausarOContinuarSesion);
    botonIniciarPausa.addEventListener("click", iniciarDescansoManual);
    botonReanudarDescanso.addEventListener("click", pausarOReanudarDescanso);
    botonAccionFinDescanso.addEventListener("click", continuarSesionTrasDescanso);
    botonFinalizar.addEventListener("click", () => mostrarModal(modalFinalizar));
    document.getElementById("cancelar-finalizacion").addEventListener("click", () => ocultarModal(modalFinalizar));
    document.getElementById("cerrar-modal-finalizacion").addEventListener("click", () => ocultarModal(modalFinalizar));
    document.getElementById("confirmar-finalizacion").addEventListener("click", finalizarSesion);
    modalFinalizar.addEventListener("click", (evento) => { if (evento.target === modalFinalizar) ocultarModal(modalFinalizar); });

    actualizarProgresoPausas();
    actualizarInterfazSesion();
});
