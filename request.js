async function fetchNews() {
    try {
        const response = await fetch('https://www.espn.com/espn/rss/ncf/news', {
            redirect: 'follow' // Asegura que las redirecciones sean seguidas
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.text(); // Cambia a text() ya que es un RSS feed
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error('Fetch failed: Network or CORS issue');
        } else {
            console.error('An unexpected error occurred:', error);
        }
        throw error; // Re-throw the error after logging it
    }
}
