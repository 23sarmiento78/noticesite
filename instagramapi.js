const fetch = require('node-fetch');

async function publicarEnInstagram(imageUrl, caption, accessToken, instagramUserId) {
    try {
        // 1. Crear contenedor de medios
        const mediaResponse = await fetch(`https://graph.facebook.com/v19.0/${instagramUserId}/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: caption
            })
        });

        const mediaData = await mediaResponse.json();
        const creationId = mediaData.id;

        // 2. Publicar contenedor de medios
        const publishResponse = await fetch(`https://graph.facebook.com/v19.0/${instagramUserId}/media_publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                creation_id: creationId
            })
        });

        const publishData = await publishResponse.json();
        console.log('Publicación en Instagram exitosa:', publishData);
    } catch (error) {
        console.error('Error al publicar en Instagram:', error);
    }
}

// Datos de prueba (reemplaza con tus datos reales)
const imageUrl = 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=600';
const caption = 'esto es una llamada de prueba';
const accessToken = 'IGAAJhfDpNc1JBZAE9hUF9Ua3A5SGs0Q3VleGtyazJ0T29UdnROeG9mVXd0YVpkXzVSeTVfZATA1XzNZAVTNqY0xlMlZAYRXNNZATRvRDAtNjZAaSmk5SmhUUUpmektMa0NxbGMzX1dLbEFaWk1xOVVMWjF1STYzOW13eERtem16YVVpNAZDZD';
const instagramUserId = '73292541454';

// Llama a la función para publicar en Instagram
publicarEnInstagram(imageUrl, caption, accessToken, instagramUserId);