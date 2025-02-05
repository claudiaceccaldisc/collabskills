const API_URL = "http://127.0.0.1:8000/api/projects.php";

// 🎯 Charger les projets
function loadProjects() {
    fetch(API_URL + "?action=getProjects")
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById("projectsTableBody");
        const searchValue = document.getElementById("searchInput").value.toLowerCase();
        const selectedStatus = document.getElementById("statusFilter").value;

        tableBody.innerHTML = "";

        data.forEach(project => {
            if (searchValue && !project.name.toLowerCase().includes(searchValue)) {
                return;
            }

            if (selectedStatus !== "all" && project.status !== selectedStatus) {
                return;
            }

            const row = `<tr>
                <td>${project.name}</td>
                <td>${project.description}</td>
                <td>${project.status}</td>
                <td>${project.deadline}</td>
                <td>
                    <button class="edit" onclick="editProject(${project.id})">✏️ Modifier</button>
                    <button class="delete" onclick="deleteProject(${project.id})">🗑️ Supprimer</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    })
    .catch(error => console.error("❌ Erreur de chargement des projets :", error));
}

// 🎯 Modifier un projet
function editProject(id) {
    fetch(`${API_URL}?action=getProjectById&id=${id}`)
    .then(response => response.json())
    .then(project => {
        if (!project || !project.id) {
            console.error("❌ Projet introuvable !");
            return;
        }

        document.getElementById("projectId").value = project.id;
        document.getElementById("projectName").value = project.name;
        document.getElementById("projectDescription").value = project.description;
        document.getElementById("projectStatus").value = project.status;
        document.getElementById("projectDeadline").value = project.deadline;

        document.getElementById("projectModal").style.display = "block";
    })
    .catch(error => console.error("❌ Erreur récupération projet :", error));
}

// 🎯 Supprimer un projet
function deleteProject(id) {
    if (!confirm("❌ Confirmer la suppression du projet ?")) return;
    
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteProject", id })
    }).then(() => loadProjects());
}

// 🎯 Ouvrir/Fermer le formulaire
function openProjectModal() {
    document.getElementById("projectModal").style.display = "block";
}

function closeProjectModal() {
    document.getElementById("projectModal").style.display = "none";
}

// 🔹 Initialisation
document.addEventListener("DOMContentLoaded", function () {
    loadProjects();
});
