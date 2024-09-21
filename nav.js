document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.getElementById('hamburger-nav-links');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('active'); // Toggle visibility
        });
    }
});
