// ecoruta.js - Versión corregida para index.html

// 1. SELECCIÓN DE ELEMENTOS DEL DOM
const inputOrigen = document.getElementById('origen');
// Usamos 'destino' en minúscula para coincidir exactamente con el HTML de index.html
const inputDestino = document.getElementById('destino'); 
const btnIntercambiar = document.querySelector('.btn-intercambiar');
const formularioBusqueda = document.querySelector('.tarjeta-formulario');
const tarjetasRecientes = document.querySelectorAll('.tarjeta-recientes');

// 2. INTERACCIÓN 1: Intercambiar Origen y Destino
if (btnIntercambiar && inputOrigen && inputDestino) {
    btnIntercambiar.addEventListener('click', () => {
        const valorTemporal = inputOrigen.value;
        inputOrigen.value = inputDestino.value;
        inputDestino.value = valorTemporal;
    });
}

// 3. INTERACCIÓN 2 & 3: Validación y Envió del Formulario "Buscar Rutas" (HU-01)
if (formularioBusqueda) {
    formularioBusqueda.addEventListener('submit', (evento) => {
        // Detenemos el envío predeterminado para evitar que la página se recargue
        evento.preventDefault(); 
        
        const origen = inputOrigen ? inputOrigen.value.trim().toLowerCase() : '';
        const destino = inputDestino ? inputDestino.value.trim().toLowerCase() : '';
        
        // Validación: Campos no vacíos
        if (origen === '' || destino === '') {
            alert('Por favor, ingresa un punto de partida y de llegada.');
            return; 
        }
        
        // Escenario 2: Sin alternativas ecológicas
        if (destino === 'marte') {
            alert('En este momento no se encuentran disponibles alternativas que contribuyan al medio ambiente');
            return;
        }
        
        // Escenario 1: Rutas encontradas -> Redirección simulada a rutas.html
        alert(`Buscando alternativas sostenibles desde "${inputOrigen.value}" hacia "${inputDestino.value}"...`);
        
        // Redirige a la pantalla de alternativas (rutas.html)
        window.location.href = 'rutas.html';
    });
}

// 4. INTERACCIÓN 4: Autocompletar desde Rutas Recientes
if (tarjetasRecientes.length > 0) {
    tarjetasRecientes.forEach(tarjeta => {
        tarjeta.style.cursor = 'pointer'; 
        
        tarjeta.addEventListener('click', () => {
            const h3 = tarjeta.querySelector('h3');
            const p = tarjeta.querySelector('p');
            
            if (h3 && p && inputOrigen && inputDestino) {
                const destinoSeleccionado = h3.textContent.trim();
                let origenSeleccionado = p.textContent.trim();
                
                // Limpiamos la palabra "Desde " si existe
                origenSeleccionado = origenSeleccionado.replace(/^Desde\s+/i, '');
                
                inputOrigen.value = origenSeleccionado;
                inputDestino.value = destinoSeleccionado;
                
                // Efecto visual rápido
                tarjeta.style.transform = 'scale(0.98)';
                setTimeout(() => tarjeta.style.transform = 'scale(1)', 150);
            }
        });
    });
}

// 5. INTERACCIÓN 7: Canje de puntos (HU-03, Escenario 2)
const infoUsuario = document.querySelector('.usuario-info');

if (infoUsuario) {
    infoUsuario.style.cursor = 'pointer';
    infoUsuario.title = 'Clic para ver tus puntos';
    
    infoUsuario.addEventListener('click', () => {
        const puntosActuales = 450; 
        const confirmacion = confirm(`Tienes ${puntosActuales} puntos acumulados (Nivel 4).\n\n¿Deseas canjear 300 puntos por un 15% de descuento en mantenimiento de bicicletas?`);
        
        if (confirmacion) {
            alert('¡Canje exitoso! Se ha enviado el cupón a tu correo universitario. Ahora tienes 150 puntos restantes.');
            const nivelTexto = infoUsuario.querySelector('small');
            if (nivelTexto) nivelTexto.textContent = 'Nivel 4 (150 pts)';
        }
    });
}