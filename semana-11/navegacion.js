// navegacion.js

// 1. SELECCIÓN DEL BOTÓN
// Seleccionamos el botón de la vista detalle-ruta.html
const btnNavegacion = document.querySelector('.btn-navegacion');

// 2. VARIABLES DE ESTADO (Simulación de la HU-03)
let rutaEnCurso = false;
// Simulamos que el usuario ya tiene 4 días registrados para disparar la recompensa hoy
let diasConsecutivos = 4; 

if (btnNavegacion) {
    btnNavegacion.addEventListener('click', function() {
        
        if (!rutaEnCurso) {
            // ACCIÓN 1: Iniciar la navegación
            rutaEnCurso = true;
            
            // Cambiamos el texto y estilo del botón para la siguiente acción
            btnNavegacion.textContent = '🏁 Finalizar Ruta';
            btnNavegacion.style.backgroundColor = '#d32f2f'; // Color rojo para indicar "detener"
            
            alert('¡Navegación iniciada! Sigue las indicaciones de manera segura.');
            
        } else {
            // ACCIÓN 2: Finalizar la ruta y evaluar recompensas (HU-03, Escenario 1)
            rutaEnCurso = false;
            diasConsecutivos++; // El usuario completa su 5to día
            
            // Restauramos el botón a su estado original
            btnNavegacion.textContent = '➔ Iniciar navegación';
            btnNavegacion.style.backgroundColor = '#2E7D32'; 
            
            // Verificamos la racha para otorgar los puntos extra de bonificación
            if (diasConsecutivos >= 5) {
                alert('¡Ruta finalizada! 🎉\n\n¡Felicidades! Has registrado viajes durante 5 días consecutivos.\nEl sistema te ha otorgado puntos extra de bonificación. Puedes canjearlos por descuentos.');
                // Reiniciamos la racha tras dar el premio
                diasConsecutivos = 0; 
            } else {
                alert('¡Ruta finalizada! Sigue usando transporte sostenible para ganar más recompensas.');
            }
        }
    });
}


// INTERACCIÓN 6: Mostrar estacionamientos (HU-02)
const cajaMapa = document.querySelector('.wireframe-mapa');
const leyendaMapa = document.querySelector('.leyenda-mapa');
let estacionamientosVisibles = false;

if (cajaMapa && leyendaMapa) {
    cajaMapa.style.cursor = 'pointer';
    
    // Agregamos un texto de ayuda al mapa
    const hint = document.createElement('small');
    hint.textContent = ' (Clic para ver estacionamientos)';
    hint.style.display = 'block';
    hint.style.marginTop = '10px';
    cajaMapa.appendChild(hint);

    cajaMapa.addEventListener('click', () => {
        if (!estacionamientosVisibles) {
            // Simulamos la aparición de puntos de estacionamiento
            alert('Cargando puntos de estacionamiento seguros cercanos a "Oficina Centro"...');
            
            // Agregamos un nuevo elemento a la leyenda del mapa
            const leyendaEstacionamiento = document.createElement('span');
            leyendaEstacionamiento.id = 'leyenda-est';
            leyendaEstacionamiento.textContent = ' 🅿️ Estacionamiento Bici';
            leyendaMapa.appendChild(leyendaEstacionamiento);
            
            hint.textContent = ' (Estacionamientos mostrados)';
            estacionamientosVisibles = true;
        }
    });
}

// INTERACCIÓN 7: Canje de puntos (HU-03, Escenario 2)
const infoUsuario = document.querySelector('.usuario-info');

if (infoUsuario) {
    infoUsuario.style.cursor = 'pointer';
    infoUsuario.title = 'Clic para ver tus puntos';
    
    infoUsuario.addEventListener('click', () => {
        // Simulamos que el "Nivel 4" equivale a 450 puntos acumulados
        const puntosActuales = 450; 
        
        const confirmacion = confirm(`Tienes ${puntosActuales} puntos acumulados (Nivel 4).\n\n¿Deseas canjear 300 puntos por un 15% de descuento en mantenimiento de bicicletas?`);
        
        if (confirmacion) {
            alert('¡Canje exitoso! Se ha enviado el cupón a tu correo universitario. Ahora tienes 150 puntos restantes.');
            // Actualizamos visualmente el nivel
            const nivelTexto = infoUsuario.querySelector('small');
            if (nivelTexto) nivelTexto.textContent = 'Nivel 4 (150 pts)';
        }
    });
}