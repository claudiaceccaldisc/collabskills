// darkmode.js

// Fonction qui applique le mode sombre en fonction de la préférence stockée
function applyDarkModePreference() {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }
}

// Fonction de basculement du mode sombre et sauvegarde de la préférence
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
}

// Au chargement du DOM, on applique la préférence et on configure l'écouteur sur le bouton
document.addEventListener("DOMContentLoaded", function() {
    // Appliquer la préférence sauvegardée
    applyDarkModePreference();

    // Sélectionner le bouton de mode sombre et ajouter l'écouteur d'événement
    const darkModeToggleBtn = document.getElementById("darkModeToggle");
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener("click", toggleDarkMode);
    }
});
