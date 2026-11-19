// INTERACCIÓN 5: Seleccionar alternativa de transporte
const itemsTransporte = document.querySelectorAll('.item-transporte');

itemsTransporte.forEach(item => {
    // Si no está dentro de un enlace (como la bicicleta), lo hacemos clickeable
    if (!item.parentElement.classList.contains('enlace-tarjeta')) {
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', () => {
            // Removemos la clase 'seleccionado' de todos los elementos
            itemsTransporte.forEach(t => t.classList.remove('seleccionado'));
            
            // Le agregamos la clase al elemento clickeado
            item.classList.add('seleccionado');
        });
    }
});

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