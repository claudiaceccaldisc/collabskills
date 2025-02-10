const API_URL = "http://127.0.0.1:8000/api/projects.php";

// Vérifier l'authentification de l'utilisateur
async function checkAuth() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/session.php", {
      credentials: "same-origin"
    });
    const data = await response.json();
    if (!data.user_id) {
      console.warn("Utilisateur non connecté !");
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de session :", error);
    window.location.href = "../index.html";
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("collapsed");
}

function logout() {
  fetch("../api/auth.php?action=logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(data => {
      console.log("Déconnexion :", data.message);
      window.location.href = "../index.html";
    })
    .catch(error => {
      console.error("Erreur lors de la déconnexion :", error);
      window.location.href = "../index.html";
    });
}

function loadProjects() {
  fetch(API_URL + "?action=getProjects", { credentials: "same-origin" })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error("Erreur :", data.error);
        return;
      }
      const tableBody = document.getElementById("projectsTableBody");
      const searchValue = document.getElementById("searchInput").value.toLowerCase();
      const selectedStatus = document.getElementById("statusFilter").value;
      tableBody.innerHTML = "";
      data.forEach(project => {
        // Filtrage par recherche par nom
        if (searchValue && !project.name.toLowerCase().includes(searchValue)) {
          return;
        }
        // Filtrage par statut
        if (selectedStatus !== "all" && project.status !== selectedStatus) {
          return;
        }
        const row = `
          <tr>
            <td>${project.name}</td>
            <td>${project.description}</td>
            <td>${project.status}</td>
            <td>${project.deadline ? project.deadline : ""}</td>
            <td>
              <button class="edit" onclick="editProject(${project.id})">✏️ Modifier</button>
              <button class="delete" onclick="deleteProject(${project.id})">🗑️ Supprimer</button>
            </td>
          </tr>`;
        tableBody.innerHTML += row;
      });
    })
    .catch(error => console.error("Erreur de chargement des projets :", error));
}

function openProjectModal() {
  document.getElementById("projectModal").style.display = "block";
}

function closeProjectModal() {
  document.getElementById("projectModal").style.display = "none";
  document.getElementById("projectForm").reset();
  document.getElementById("projectId").value = "";
  document.getElementById("modalTitle").textContent = "Ajouter un Projet";
}

function addProject() {
  const name = document.getElementById("projectName").value.trim();
  const description = document.getElementById("projectDescription").value.trim();
  const status = document.getElementById("projectStatus").value;
  const deadline = document.getElementById("projectDeadline").value;
  if (!name || !description) {
    alert("Veuillez remplir tous les champs obligatoires (Nom et Description).");
    return;
  }
  const payload = {
    action: "addProject",
    name: name,
    description: description,
    status: status,
    deadline: deadline
  };
  fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Erreur lors de l'ajout du projet : " + data.error);
      } else {
        alert(data.message || "Projet ajouté !");
        loadProjects();
        closeProjectModal();
      }
    })
    .catch(error => console.error("Erreur lors de l'ajout du projet :", error));
}

function updateProject() {
  const id = document.getElementById("projectId").value;
  const name = document.getElementById("projectName").value.trim();
  const description = document.getElementById("projectDescription").value.trim();
  const status = document.getElementById("projectStatus").value;
  const deadline = document.getElementById("projectDeadline").value;
  if (!id || !name || !description) {
    alert("Tous les champs sont requis.");
    return;
  }
  const payload = {
    action: "updateProject",
    id: id,
    name: name,
    description: description,
    status: status,
    deadline: deadline
  };
  fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Erreur lors de la mise à jour du projet : " + data.error);
      } else {
        alert(data.message || "Projet mis à jour !");
        loadProjects();
        closeProjectModal();
      }
    })
    .catch(error => console.error("Erreur lors de la mise à jour du projet :", error));
}

document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
  const addProjectBtn = document.getElementById("addProjectBtn");
  if (addProjectBtn) {
    addProjectBtn.addEventListener("click", function () {
      document.getElementById("projectForm").reset();
      document.getElementById("projectId").value = "";
      document.getElementById("modalTitle").textContent = "Ajouter un Projet";
      openProjectModal();
    });
  }
  const closeBtn = document.querySelector("#projectModal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeProjectModal);
  }
  const projectForm = document.getElementById("projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const projectId = document.getElementById("projectId").value;
      if (projectId) {
        updateProject();
      } else {
        addProject();
      }
    });
  }
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", loadProjects);
  }
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", loadProjects);
  }
});

function editProject(id) {
  fetch(`${API_URL}?action=getProjectById&id=${id}`, { credentials: "same-origin" })
    .then(response => response.json())
    .then(project => {
      if (!project || project.error) {
        alert("Projet introuvable !");
        return;
      }
      document.getElementById("projectId").value = project.id;
      document.getElementById("projectName").value = project.name;
      document.getElementById("projectDescription").value = project.description;
      document.getElementById("projectStatus").value = project.status;
      document.getElementById("projectDeadline").value = project.deadline;
      document.getElementById("modalTitle").textContent = "Modifier le Projet";
      openProjectModal();
    })
    .catch(error => console.error("Erreur lors de la récupération du projet :", error));
}

function deleteProject(id) {
  if (!confirm("Confirmer la suppression du projet ?")) return;
  const payload = {
    action: "deleteProject",
    id: id
  };
  fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Erreur lors de la suppression du projet : " + data.error);
      } else {
        alert(data.message || "Projet supprimé !");
        loadProjects();
      }
    })
    .catch(error => console.error("Erreur lors de la suppression du projet :", error));
}
