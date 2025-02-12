const API_TASKS_URL = "http://127.0.0.1:8000/api/tasks.php";
const API_PROJECTS_URL = "http://127.0.0.1:8000/api/projects.php";

let taskChart; // Instance globale du graphique

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
    loadTasks();
    loadTaskCounts();
    
    const taskForm = document.getElementById("taskForm");
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const taskId = document.getElementById("taskId").value;
        if (taskId) {
            updateTask();
        } else {
            addTask();
        }
    });
    
    document.getElementById("cancelEdit").addEventListener("click", function(){
        resetForm();
    });
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
    .then(() => {
        window.location.href = "../index.html";
    })
    .catch(error => {
        console.error("Erreur lors de la déconnexion :", error);
        window.location.href = "../index.html";
    });
}

// Charger la liste des projets pour le sélecteur
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

// Charger toutes les tâches et les afficher dans le tableau
async function loadTasks() {
    try {
        const response = await fetch(API_TASKS_URL + "?action=getTasks");
        const tasks = await response.json();
        const tableBody = document.getElementById("tasksTableBody");
        tableBody.innerHTML = "";
        tasks.forEach(task => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${task.project_name}</td>
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td>${task.due_date}</td>
                <td>${task.status}</td>
            `;
            // Actions
            const actionsCell = document.createElement("td");
            const editBtn = document.createElement("button");
            editBtn.textContent = "Modifier";
            editBtn.classList.add("action-btn", "edit-btn");
            editBtn.addEventListener("click", () => editTask(task));
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Supprimer";
            deleteBtn.classList.add("action-btn", "delete-btn");
            deleteBtn.addEventListener("click", () => deleteTask(task.id));
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des tâches :", error);
    }
}

// Charger les statistiques des tâches et dessiner le graphique
async function loadTaskCounts() {
    try {
        const response = await fetch(API_TASKS_URL + "?action=getTaskCounts");
        const data = await response.json();
        // Prévoir des compteurs par défaut
        let counts = {"à faire": 0, "en cours": 0, "terminé": 0};
        data.forEach(item => {
            counts[item.status] = parseInt(item.count);
        });
        renderChart(counts);
    } catch (error) {
        console.error("Erreur lors du chargement des statistiques des tâches :", error);
    }
}

function renderChart(counts) {
    const ctx = document.getElementById("taskChart").getContext("2d");
    const data = {
        labels: ["À faire", "En cours", "Terminé"],
        datasets: [{
            label: "Nombre de tâches",
            data: [counts["à faire"], counts["en cours"], counts["terminé"]],
            backgroundColor: ["#f39c12", "#3498db", "#2ecc71"]
        }]
    };
    const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.parsed.y + " tâche(s)";
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    };
    if (taskChart) {
        taskChart.destroy();
    }
    taskChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
}

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
        await response.json();
        resetForm();
        loadTasks();
        loadTaskCounts();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
    }
}

async function updateTask() {
    const taskId = document.getElementById("taskId").value;
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
                action: "updateTask",
                id: taskId,
                project_id: project_id,
                title: title,
                description: description,
                due_date: due_date,
                status: status
            })
        });
        await response.json();
        resetForm();
        loadTasks();
        loadTaskCounts();
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
    }
}

async function deleteTask(taskId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        return;
    }
    try {
        const response = await fetch(API_TASKS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "deleteTask",
                id: taskId
            })
        });
        await response.json();
        loadTasks();
        loadTaskCounts();
    } catch (error) {
        console.error("Erreur lors de la suppression de la tâche :", error);
    }
}

function editTask(task) {
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskProject").value = task.project_id;
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskDueDate").value = task.due_date;
    document.getElementById("taskStatus").value = task.status;
    
    document.getElementById("submitButton").textContent = "Modifier la Tâche";
    document.getElementById("formTitle").textContent = "Modifier la Tâche";
    document.getElementById("cancelEdit").style.display = "inline-block";
}

function resetForm() {
    document.getElementById("taskForm").reset();
    document.getElementById("taskId").value = "";
    document.getElementById("submitButton").textContent = "Ajouter la Tâche";
    document.getElementById("formTitle").textContent = "Ajouter une Tâche";
    document.getElementById("cancelEdit").style.display = "none";
}
