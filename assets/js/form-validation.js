document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada.

            // Validación del lado del cliente.
            if (!validateForm()) {
                return; // Detener si la validación falla.
            }

            const formData = new FormData(form);
            formData.append('action', 'send_contact_form'); // Acción para el backend de WordPress.

            // Envía los datos a admin-ajax.php
            fetch('/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirige a la página de éxito
                    window.location.href = '/wp-content/themes/Evelation/success.php'; // Asegúrate que esta ruta sea correcta.
                } else {
                    // Muestra el error devuelto por el servidor
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = data.error || 'Hubo un error al enviar el mensaje.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.';
            });
        });
    }

    // Validación básica del formulario.
    function validateForm() {
        const phone = document.getElementById('phone').value;
        if (!phone) {
            document.getElementById('phoneError').style.display = 'block';
            return false;
        } else {
            document.getElementById('phoneError').style.display = 'none';
        }
        return true;
    }
});