// Variables globales pour stocker l'ensemble des tâches et compétences
let allTasks = [];
let allSkills = [];

document.addEventListener("DOMContentLoaded", function() {
    loadUserName();
    loadProjects();
    loadCollaborators();
    loadTasksData();
    loadSkillsData();

    // Configure bouton toggle pour la card Tâches
    const toggleTasksBtn = document.getElementById("toggleTasksBtn");
    if (toggleTasksBtn) {
        toggleTasksBtn.setAttribute("data-showall", "false");
        toggleTasksBtn.addEventListener("click", function () {
            const showAll = toggleTasksBtn.getAttribute("data-showall") === "true";
            displayTasks(!showAll);
            toggleTasksBtn.textContent = !showAll ? "Voir moins" : "Voir plus";
            toggleTasksBtn.setAttribute("data-showall", (!showAll).toString());
        });
    }
    const taskFilter = document.getElementById("taskFilter");
    if (taskFilter) {
        taskFilter.addEventListener("change", function () {
            displayTasks(false);
            if (toggleTasksBtn) toggleTasksBtn.setAttribute("data-showall", "false");
        });
    }

    // Configure bouton toggle pour la card Compétences
    const toggleSkillsBtn = document.getElementById("toggleSkillsBtn");
    if (toggleSkillsBtn) {
        toggleSkillsBtn.setAttribute("data-showall", "false");
        toggleSkillsBtn.addEventListener("click", function () {
            const showAll = toggleSkillsBtn.getAttribute("data-showall") === "true";
            displaySkills(!showAll);
            toggleSkillsBtn.textContent = !showAll ? "Voir moins" : "Voir plus";
            toggleSkillsBtn.setAttribute("data-showall", (!showAll).toString());
        });
    }
    const skillFilter = document.getElementById("skillFilter");
    if (skillFilter) {
        skillFilter.addEventListener("change", function () {
            displaySkills(false);
            if (toggleSkillsBtn) toggleSkillsBtn.setAttribute("data-showall", "false");
        });
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
}

function logout() {
    fetch("../api/auth.php?action=logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = "../index.html";
    })
    .catch(error => {
        console.error("Erreur lors de la déconnexion :", error);
        window.location.href = "../index.html";
    });
}

function loadUserName() {
    fetch("../api/auth.php?action=getUser")
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("userName").textContent = data.first_name + " " + data.last_name;
        } else {
            document.getElementById("userName").textContent = "Utilisateur inconnu";
        }
    })
    .catch(error => console.error("Erreur de chargement de l'utilisateur :", error));
}

function loadProjects() {
    fetch("../api/dashboard.php?action=getProjects")
    .then(response => response.json())
    .then(data => {
        const projectsDiv = document.getElementById("projectsContent");
        if (Array.isArray(data) && data.length > 0) {
            projectsDiv.innerHTML = data.map(proj => `<p>${proj.name} - ${proj.status}</p>`).join("");
        } else {
            projectsDiv.textContent = "Aucun projet en cours.";
        }
    })
    .catch(error => {
        console.error("Erreur chargement projets :", error);
        document.getElementById("projectsContent").textContent = "Erreur de chargement.";
    });
}

function loadCollaborators() {
    fetch("../api/dashboard.php?action=getCollaborators")
    .then(response => response.json())
    .then(data => {
        const collabDiv = document.getElementById("collaboratorsContent");
        if (Array.isArray(data) && data.length > 0) {
            collabDiv.innerHTML = data.map(user => `<p>${user.first_name} ${user.last_name}</p>`).join("");
        } else {
            collabDiv.textContent = "Aucun collaborateur trouvé.";
        }
    })
    .catch(error => {
        console.error("Erreur chargement collaborateurs :", error);
        document.getElementById("collaboratorsContent").textContent = "Erreur de chargement.";
    });
}

/* --- Fonctions pour la card TÂCHES --- */
function loadTasksData() {
    fetch("../api/dashboard.php?action=getTasks")
    .then(response => response.json())
    .then(data => {
        allTasks = data;
        populateTaskFilter();
        displayTasks(false);
    })
    .catch(error => console.error("Erreur lors du chargement des tâches :", error));
}

function populateTaskFilter() {
    const select = document.getElementById("taskFilter");
    if (!select) return;
    let projectsSet = new Set();
    allTasks.forEach(task => {
        if (task.project_name) {
            projectsSet.add(task.project_name);
        }
    });
    select.innerHTML = `<option value="">Tous les projets</option>`;
    projectsSet.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function displayTasks(showAll) {
    let filtered = allTasks;
    const filterValue = document.getElementById("taskFilter") ? document.getElementById("taskFilter").value : "";
    if (filterValue) {
        filtered = filtered.filter(task => task.project_name === filterValue);
    }
    if (!showAll) {
        filtered = filtered.slice(0, 3);
    }
    const tasksContent = document.getElementById("tasksContent");
    tasksContent.innerHTML = "";
    if (filtered.length === 0) {
        tasksContent.innerHTML = "<p>Aucune tâche trouvée.</p>";
        return;
    }
    filtered.forEach(task => {
        const p = document.createElement("p");
        p.textContent = `${task.title} - ${task.status}`;
        p.style.cursor = "pointer";
        p.addEventListener("click", () => showTaskSummary(task.project_id));
        tasksContent.appendChild(p);
    });
}

/* --- Fonction d'affichage du modal de résumé des tâches --- */
function showTaskSummary(projectId) {
    fetch(`../api/dashboard.php?action=getTaskSummary&project_id=${projectId}`)
    .then(response => response.json())
    .then(summaryTasks => {
        const summaryTableBody = document.getElementById("summaryTableBody");
        summaryTableBody.innerHTML = "";
        if (Array.isArray(summaryTasks) && summaryTasks.length > 0) {
            summaryTasks.forEach(task => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>${task.status}</td>
                    <td>${task.due_date}</td>
                `;
                summaryTableBody.appendChild(row);
            });
        } else {
            summaryTableBody.innerHTML = "<tr><td colspan='3'>Aucune tâche en cours ou à faire.</td></tr>";
        }
        document.getElementById("taskSummaryModal").style.display = "block";
    })
    .catch(error => console.error("Erreur lors du chargement du résumé des tâches :", error));
}

function closeSummaryModal() {
    document.getElementById("taskSummaryModal").style.display = "none";
}

/* --- Fonctions pour la card COMPÉTENCES --- */
function loadSkillsData() {
    fetch("../api/dashboard.php?action=getSkills")
    .then(response => response.json())
    .then(data => {
        allSkills = data;
        populateSkillFilter();
        displaySkills(false);
    })
    .catch(error => console.error("Erreur lors du chargement des compétences :", error));
}

function populateSkillFilter() {
    const select = document.getElementById("skillFilter");
    if (!select) return;
    let categories = new Set();
    allSkills.forEach(skill => {
        if (skill.category) {
            categories.add(skill.category);
        }
    });
    select.innerHTML = `<option value="">Toutes les catégories</option>`;
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function displaySkills(showAll) {
    let filtered = allSkills;
    const filterValue = document.getElementById("skillFilter") ? document.getElementById("skillFilter").value : "";
    if (filterValue) {
        filtered = filtered.filter(skill => skill.category === filterValue);
    }
    if (!showAll) {
        filtered = filtered.slice(0, 3);
    }
    const skillsContent = document.getElementById("skillsContent");
    skillsContent.innerHTML = "";
    if (filtered.length === 0) {
        skillsContent.innerHTML = "<p>Aucune compétence trouvée.</p>";
        return;
    }
    filtered.forEach(skill => {
        const li = document.createElement("p");
        li.innerHTML = `<strong>${skill.skill_name}</strong>`;
        skillsContent.appendChild(li);
    });
}
