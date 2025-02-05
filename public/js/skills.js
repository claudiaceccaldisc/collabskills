const API_SKILLS_URL = "http://127.0.0.1:8000/api/skills.php";

// 🔹 Vérifier l'authentification
async function checkAuth() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/session.php");
        const data = await response.json();
        
        if (!data.user_id) {
            console.warn("🔴 Utilisateur non connecté !");
            if (window.location.pathname.includes("skills.html")) {
                window.location.href = "../index.html";
            }
        }
    } catch (error) {
        console.error("❌ Erreur de vérification de session :", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("📡 Chargement des compétences...");

    checkAuth();
    loadAllSkills();
    document.getElementById("skillForm")?.addEventListener("submit", function (e) {
        e.preventDefault();
        addSkill();
    });
});

// 🎯 Charger toutes les compétences
async function loadAllSkills() {
    try {
        const response = await fetch(`${API_SKILLS_URL}?all=true`);
        const data = await response.json();
        console.log("📡 Données reçues :", data);

        if (!Array.isArray(data)) {
            console.error("❌ Erreur API :", data);
            return;
        }

        let skillsList = document.getElementById("allSkillsList");
        skillsList.innerHTML = "";

        data.forEach(skill => {
            let skillItem = document.createElement("li");
            skillItem.innerHTML = `<strong>${skill.skill_name}</strong> - <i>${skill.first_name} ${skill.last_name}</i>`;
            skillsList.appendChild(skillItem);
        });

    } catch (error) {
        console.error("❌ Erreur chargement compétences :", error);
    }
}

// 🎯 Ajouter une compétence
async function addSkill() {
    const skillName = document.getElementById("skillName").value.trim();

    if (!skillName) {
        alert("⚠️ Veuillez entrer une compétence.");
        return;
    }

    try {
        const response = await fetch(API_SKILLS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", skill_name: skillName })
        });

        const result = await response.json();
        console.log("✅ Ajouté :", result.message || result.error);
        loadAllSkills();
    } catch (error) {
        console.error("❌ Erreur ajout :", error);
    }
}
