// Variables globales pour stocker les données
let allProjects = [];
let allTasks = [];
let allCollaborators = [];
let allSkills = [];
let projectStatusChart; // Instance du graphique en barres

document.addEventListener("DOMContentLoaded", function() {
    // Chargement initial
    loadUserName();
    loadProjects();
    loadTasksData();
    loadCollaborators();
    loadSkillsData();
    loadProjectStatusChart();

    // Rafraîchissement automatique toutes les 5 secondes
    setInterval(() => {
        loadProjects();
        loadTasksData();
    }, 5000);

    // Rafraîchissement lors du focus de la fenêtre
    window.addEventListener("focus", () => {
        loadProjects();
        loadTasksData();
    });

    // Sidebar toggle
    const sidebarToggleBtn = document.querySelector('.toggle-sidebar');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("collapsed");
        });
    }

    // Mode sombre
    const darkModeToggleBtn = document.getElementById('darkModeToggle');
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener("click", () => {
            toggleDarkMode();
            // Recharger le graphique pour actualiser les couleurs en fonction du mode
            loadProjectStatusChart();
        });
    }
});

// Déconnexion
function logout() {
    fetch("../api/auth.php?action=logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(() => window.location.href = "../index.html")
    .catch(error => console.error("Erreur lors de la déconnexion :", error));
}

// Mode sombre
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Charger le nom de l'utilisateur
function loadUserName() {
    fetch("../api/auth.php?action=getUser")
    .then(response => response.json())
    .then(data => {
        document.getElementById("userName").textContent = data.success ? `${data.first_name} ${data.last_name}` : "Utilisateur inconnu";
    })
    .catch(error => console.error("Erreur de chargement de l'utilisateur :", error));
}

// Charger le dernier projet et mettre à jour la card Projets
function loadProjects() {
    fetch("../api/dashboard.php?action=getProjects")
    .then(response => response.json())
    .then(data => {
        allProjects = data;
        if (Array.isArray(data) && data.length > 0) {
            const lastProj = data[0];
            document.getElementById("projectsContent").innerHTML =
                `<strong>${lastProj.name}</strong><br>Status: ${lastProj.status}`;
        } else {
            document.getElementById("projectsContent").textContent = "Aucun projet enregistré.";
        }
    })
    .catch(error => console.error("Erreur chargement projets :", error));
}

// Charger la dernière tâche et mettre à jour la card Tâches
function loadTasksData() {
    fetch("../api/dashboard.php?action=getTasks")
    .then(response => response.json())
    .then(data => {
        allTasks = data;
        if (Array.isArray(data) && data.length > 0) {
            const lastTask = data[0];
            document.getElementById("tasksContent").innerHTML =
                `<strong>${lastTask.title}</strong><br>Status: ${lastTask.status}<br>Date limite: ${lastTask.due_date}`;
        } else {
            document.getElementById("tasksContent").textContent = "Aucune tâche enregistrée.";
        }
    })
    .catch(error => console.error("Erreur chargement tâches :", error));
}

// Charger les collaborateurs et mettre à jour la card Collaborateurs
function loadCollaborators() {
    fetch("../api/dashboard.php?action=getCollaborators")
    .then(response => response.json())
    .then(data => {
        allCollaborators = data;
        if (Array.isArray(data) && data.length > 0) {
            const lastCollab = data[0];
            document.getElementById("collaboratorsContent").innerHTML =
                `<strong>${lastCollab.first_name} ${lastCollab.last_name}</strong>`;
        } else {
            document.getElementById("collaboratorsContent").textContent = "Aucun collaborateur trouvé.";
        }
    })
    .catch(error => console.error("Erreur chargement collaborateurs :", error));
}

// Charger les compétences et mettre à jour la card Compétences
function loadSkillsData() {
    fetch("../api/dashboard.php?action=getSkills")
    .then(response => response.json())
    .then(data => {
        allSkills = data;
        if (Array.isArray(data) && data.length > 0) {
            const lastSkill = data[0];
            document.getElementById("skillsContent").innerHTML =
                `<strong>${lastSkill.skill_name}</strong><br>Catégorie: ${lastSkill.category}`;
        } else {
            document.getElementById("skillsContent").textContent = "Aucune compétence trouvée.";
        }
    })
    .catch(error => console.error("Erreur chargement compétences :", error));
}

// Charger et afficher le graphique en barres des projets
function loadProjectStatusChart() {
    fetch("../api/dashboard.php?action=getProjectStatusCounts")
    .then(response => response.json())
    .then(data => {
        let total = 0;
        let statusCounts = { "terminé": 0, "en cours": 0, "à faire": 0 };
        data.forEach(item => {
            statusCounts[item.status] = parseInt(item.count);
            total += parseInt(item.count);
        });
        let percentages = { "terminé": 0, "en cours": 0, "à faire": 0 };
        if (total > 0) {
            percentages["terminé"] = ((statusCounts["terminé"] || 0) / total * 100).toFixed(0);
            percentages["en cours"] = ((statusCounts["en cours"] || 0) / total * 100).toFixed(0);
            percentages["à faire"] = ((statusCounts["à faire"] || 0) / total * 100).toFixed(0);
        }
        renderProjectStatusChart(percentages);
    })
    .catch(error => console.error("Erreur chargement du graphique :", error));
}

function renderProjectStatusChart(percentages) {
    const ctx = document.getElementById("projectStatusChart").getContext("2d");
    const isDark = document.body.classList.contains("dark-mode");
    
    const data = {
        labels: ["Terminé", "En cours", "À faire"],
        datasets: [{
            label: "Pourcentage",
            data: [percentages["terminé"], percentages["en cours"], percentages["à faire"]],
            backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"],
            borderColor: isDark ? ["#fff", "#fff", "#fff"] : ["#27ae60", "#f39c12", "#c0392b"],
            borderWidth: 1
        }]
    };
    if (projectStatusChart) {
        projectStatusChart.destroy();
    }
    projectStatusChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) { return value + "%" },
                        color: isDark ? "#fff" : "#000"
                    },
                    grid: {
                        color: isDark ? "#fff" : "#ccc"
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? "#fff" : "#000"
                    },
                    grid: {
                        color: isDark ? "#fff" : "#ccc"
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ": " + context.parsed.y + "%";
                        }
                    }
                },
                legend: {
                    labels: {
                        color: isDark ? "#fff" : "#000"
                    }
                }
            }
        }
    });
}
