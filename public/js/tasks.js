const API_TASKS_URL = "http://127.0.0.1:8000/api/tasks.php";
const API_PROJECTS_URL = "http://127.0.0.1:8000/api/projects.php"; // Pour récupérer tous les projets

// Vérifier que l'utilisateur est connecté
async function checkAuth() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/session.php");
        const data = await response.json();
        if (!data.user_id) {
            window.location.href = "../index.html";
        }
    } catch (error) {
        console.error("Erreur de vérification de session :", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    checkAuth();
    loadProjectsDropdown();
    loadTasksGrouped();
    
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
        taskForm.addEventListener("submit", function (e) {
            e.preventDefault();
            addTask();
        });
    }
});

// Fonction toggle pour la sidebar
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

// Charger la liste de tous les projets pour remplir le sélecteur
async function loadProjectsDropdown() {
    try {
        const response = await fetch(`${API_PROJECTS_URL}?action=getAllProjects`);
        const projects = await response.json();
        const select = document.getElementById("taskProject");
        select.innerHTML = `<option value="">--Sélectionnez un projet--</option>`;
        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des projets :", error);
    }
}

// Charger les tâches assignées à l'utilisateur et grouper par projet pour n'afficher que la tâche la plus récente
async function loadTasksGrouped() {
    try {
        const response = await fetch(API_TASKS_URL + "?action=getTasks");
        const tasks = await response.json();
        const grouped = {};
        tasks.forEach(task => {
            if (!grouped[task.project_id] || task.id > grouped[task.project_id].id) {
                grouped[task.project_id] = task;
            }
        });
        const tableBody = document.getElementById("tasksTableBody");
        tableBody.innerHTML = "";
        Object.values(grouped).forEach(task => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${task.project_name}</td>
                <td>${task.title}</td>
            `;
            row.addEventListener("click", function () {
                showTaskSummary(task.project_id);
            });
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des tâches :", error);
    }
}

// Afficher le résumé des 5 dernières tâches (à faire ou en cours) pour un projet donné
async function showTaskSummary(projectId) {
    try {
        const response = await fetch(`${API_TASKS_URL}?action=getTaskSummary&project_id=${projectId}`);
        const summaryTasks = await response.json();
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
    } catch (error) {
        console.error("Erreur lors du chargement du résumé des tâches :", error);
    }
}

// Fermer le modal de résumé des tâches
function closeSummaryModal() {
    document.getElementById("taskSummaryModal").style.display = "none";
}

// Ajouter une nouvelle tâche via le formulaire
async function addTask() {
    const project_id = document.getElementById("taskProject").value;
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const due_date = document.getElementById("taskDueDate").value;
    const status = document.getElementById("taskStatus").value;

    if (!project_id || !title || !due_date || !status) {
        alert("Veuillez remplir les champs obligatoires : projet, titre, date d'échéance et statut.");
        return;
    }

    try {
        const response = await fetch(API_TASKS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "addTask",
                project_id: project_id,
                title: title,
                description: description,
                due_date: due_date,
                status: status
            })
        });
        const result = await response.json();
        loadTasksGrouped();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
    }
}
