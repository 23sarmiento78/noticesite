document.addEventListener("DOMContentLoaded", () => {
  const loadComponent = (elementId, filePath) => {
    const element = document.getElementById(elementId);
    if (element) {
      fetch(filePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `No se pudo cargar el componente: ${filePath} (Status: ${response.status})`,
            );
          }
          return response.text();
        })
        .then((data) => {
          element.innerHTML = data;

          // Ejecutar scripts de forma segura
          const scripts = Array.from(element.getElementsByTagName("script"));
          scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
          });
        })
        .catch((error) => console.error("Error al cargar componente:", error));
    }
  };

  // Cargar los componentes comunes
  loadComponent("nav-placeholder", "_nav.html");
  loadComponent("footer-placeholder", "_footer.html");
});