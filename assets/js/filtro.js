document.addEventListener('DOMContentLoaded', function() {
    const filterLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const items = document.querySelectorAll('[data-category]');

    filterLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const filter = this.dataset.filter;

            items.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});