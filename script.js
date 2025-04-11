const menuIcon = document.querySelector("#menu-icon");
const navLinks = document.querySelector(".nav-links");
menuIcon.onclick = () => {
    navLinks.classList.toggle("active");
}

//MODO OSCURO

const darkModeToggle = document.querySelector("#dark-mode-toggle");

darkModeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");

    // Cambia el texto del botón según el modo
    if (document.body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "☀️";
    } else {
        darkModeToggle.textContent = "🌙";
    }
};
