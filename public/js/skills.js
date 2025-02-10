const API_SKILLS_URL = "http://127.0.0.1:8000/api/skills.php";
let allSkills = [];

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
    loadSkillsData();

    const skillForm = document.getElementById("skillForm");
    if (skillForm) {
        skillForm.addEventListener("submit", function (e) {
            e.preventDefault();
            addSkill();
        });
    }

    // Configurer le bouton toggle pour les compétences
    const toggleSkillsBtn = document.getElementById("toggleSkillsBtn");
    if (toggleSkillsBtn) {
        toggleSkillsBtn.setAttribute("data-showall", "false");
        toggleSkillsBtn.addEventListener("click", function() {
            const showAll = toggleSkillsBtn.getAttribute("data-showall") === "true";
            displaySkills(!showAll);
            toggleSkillsBtn.textContent = !showAll ? "Voir moins" : "Voir plus";
            toggleSkillsBtn.setAttribute("data-showall", (!showAll).toString());
        });
    }

    // Configurer le filtre pour les compétences
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

function loadSkillsData() {
    fetch(`${API_SKILLS_URL}?all=true`)
    .then(response => response.json())
    .then(data => {
        if (!Array.isArray(data)) {
            console.error("Erreur API :", data);
            return;
        }
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
    const skillsList = document.getElementById("allSkillsList");
    skillsList.innerHTML = "";
    if (filtered.length === 0) {
        skillsList.innerHTML = "<li>Aucune compétence trouvée.</li>";
        return;
    }
    filtered.forEach(skill => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${skill.skill_name}</strong>`;
        skillsList.appendChild(li);
    });
}

async function addSkill() {
    const skillName = document.getElementById("skillName").value.trim();
    const skillCategory = document.getElementById("skillCategory").value;
    if (!skillName || !skillCategory) {
        alert("⚠️ Veuillez entrer une compétence et sélectionner une catégorie.");
        return;
    }
    try {
        const response = await fetch(API_SKILLS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", skill_name: skillName, skill_category: skillCategory })
        });
        const result = await response.json();
        loadSkillsData();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la compétence :", error);
    }
}
