const API_URL = "http://127.0.0.1:8000/api/auth.php";

// 🎯 Basculer entre connexion et inscription
document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("registerContainer").classList.remove("hidden");
});

document.getElementById("backToLogin").addEventListener("click", () => {
    document.getElementById("registerContainer").classList.add("hidden");
    document.getElementById("loginContainer").classList.remove("hidden");
});

// 🎯 Vérifier si un champ est vide
function isFieldEmpty(value) {
    return value.trim() === "";
}

// 🎯 Afficher un message utilisateur
function showMessage(elementId, message, isSuccess = false) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.style.color = isSuccess ? "green" : "red";
}

// 🎯 Gérer l'inscription
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = document.getElementById('first_name').value.trim();
    const lastName = document.getElementById('last_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const password = document.getElementById('reg_password').value.trim();

    if (isFieldEmpty(firstName) || isFieldEmpty(lastName) || isFieldEmpty(email) || isFieldEmpty(password)) {
        showMessage("registerMessage", "⚠️ Tous les champs doivent être remplis !");
        return;
    }

    const data = {
        action: 'register',
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("📡 Réponse JSON (Inscription) :", result);

        showMessage("registerMessage", result.message || result.error, result.message === "Inscription réussie !");

        if (result.message === "Inscription réussie !") {
            setTimeout(() => {
                document.getElementById("registerContainer").classList.add("hidden");
                document.getElementById("loginContainer").classList.remove("hidden");
            }, 2000);
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error);
        showMessage("registerMessage", "Une erreur est survenue. Veuillez réessayer.");
    }
});

// 🎯 Gérer la connexion et rediriger vers `dashboard.html`
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (isFieldEmpty(email) || isFieldEmpty(password)) {
        showMessage("loginMessage", "⚠️ Email et mot de passe requis !");
        return;
    }

    const data = {
        action: 'login',
        email: email,
        password: password
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("📡 Réponse JSON (Connexion) :", result);

        showMessage("loginMessage", result.message || result.error, !!result.token);

        if (result.token) {
            console.log("🔑 Token reçu :", result.token);
            localStorage.setItem("authToken", result.token);

            setTimeout(() => {
                window.location.href = "../pages/dashboard.html"; // Redirection après connexion
            }, 1500);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        showMessage("loginMessage", "Une erreur est survenue. Veuillez réessayer.");
    }
});
//gère l'affichage dans dashboard.html
document.addEventListener("DOMContentLoaded", function () {
    fetch("../api/auth.php?action=getUser")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("user-name").textContent = `Bienvenue, ${data.first_name} ${data.last_name} !`;
            } else {
                console.error("Erreur :", data.message);
                document.getElementById("user-name").textContent = "Bienvenue, invité !";
            }
        })
        .catch(error => console.error("Erreur de chargement :", error));
});

// 🎯 Vérifier l'authentification et rediriger si nécessaire
function checkAuth() {
    const token = localStorage.getItem("authToken");

    console.log("🔎 Vérification du token au chargement :", token);

    if (token) {
        if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
            console.log("✅ Utilisateur connecté, redirection vers dashboard.html");
            window.location.href = "dashboard.html";
        }
    } else {
        console.log("🔴 Aucun token trouvé, accès libre.");
    }
}

// 🎯 Déconnexion et suppression du token
function logout() {
    console.log("🚪 Déconnexion en cours...");
    localStorage.removeItem("authToken");
    window.location.href = "index.html";
}

// 🎛️ Sidebar : bascule automatique selon la taille de l'écran
function checkScreenSize() {
    const sidebar = document.getElementById("sidebar");
    if (window.innerWidth < 768) {
        sidebar.classList.add("collapsed");
    } else {
        sidebar.classList.remove("collapsed");
    }
}

// 🎛️ Sidebar : bascule manuelle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
}

// 🎯 Chargement des infos de l'utilisateur connecté
document.addEventListener("DOMContentLoaded", function () {
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUser' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("userName").innerText = `${data.first_name} ${data.last_name}`;
        } else {
            document.getElementById("userName").innerText = "Utilisateur";
        }
    })
    .catch(error => console.error('❌ Erreur de chargement utilisateur:', error));

    // Vérification automatique de la taille de l'écran
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
});

// 🎯 Chargement des compétences (Skills)
function fetchSkills() {
    fetch('/api/skills.php?user_id=1')
        .then(response => response.json())
        .then(data => {
            let skillsDiv = document.getElementById("skillsList");
            skillsDiv.innerHTML = "";
            data.forEach(skill => {
                skillsDiv.innerHTML += `<p>${skill.skill_name} <button onclick="deleteSkill(${skill.id})">Supprimer</button></p>`;
            });
        });
}

function addSkill() {
    let skill = document.getElementById("newSkill").value;
    fetch('/api/skills.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'add', user_id: 1, skill_name: skill })
    }).then(() => fetchSkills());
}

function deleteSkill(id) {
    fetch('/api/skills.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action: 'delete', user_id: 1, skill_id: id })
    }).then(() => fetchSkills());
}

fetchSkills();
