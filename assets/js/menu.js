document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links-container');

    menuToggle.addEventListener('click', function() {
        navLinksContainer.classList.toggle('show');
    });
});