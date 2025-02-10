<?php
require __DIR__ . '/config.php';

// Démarrer la session si elle n'est pas déjà démarrée
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
error_log("SESSION: " . print_r($_SESSION, true)); // Vérification des valeurs en session

// Activer CORS pour éviter les erreurs AJAX
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Récupérer les données JSON envoyées (uniquement pour POST)
$input = json_decode(file_get_contents("php://input"), true) ?? [];

// Vérifier si une action est définie
$action = $input['action'] ?? $_GET['action'] ?? null;
if (!$action) {
    echo json_encode(["error" => "Requête invalide"]);
    exit;
}

// 📝 Gérer l'inscription
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $first_name = trim($input['first_name'] ?? '');
    $last_name  = trim($input['last_name'] ?? '');
    $email      = trim($input['email'] ?? '');
    $password   = trim($input['password'] ?? '');

    if (empty($first_name) || empty($last_name) || empty($email) || empty($password)) {
        echo json_encode(["error" => "Tous les champs sont requis"]);
        exit;
    }

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["error" => "Cet email est déjà utilisé"]);
        exit;
    }

    // Hasher le mot de passe et insérer l'utilisateur
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");

    if ($stmt->execute([$first_name, $last_name, $email, $hashed_password])) {
        echo json_encode(["message" => "Inscription réussie !"]);
    } else {
        echo json_encode(["error" => "Erreur lors de l'inscription"]);
    }
    exit;
}

// 🔑 Gérer la connexion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $email    = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($email) || empty($password)) {
        echo json_encode(["error" => "Email et mot de passe requis"]);
        exit;
    }

    // Vérifier si l'utilisateur existe
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["error" => "Identifiants incorrects"]);
        exit;
    }

    // Stocker les informations de l'utilisateur dans la session
    $_SESSION['user_id']         = $user['id'];
    $_SESSION['user_email']      = $email;
    $_SESSION['user_first_name'] = $user['first_name'];
    $_SESSION['user_last_name']  = $user['last_name'];

    // Générer un token simple (idéalement JWT, mais ici basique)
    $token = bin2hex(random_bytes(16));

    echo json_encode([
        "message"    => "Connexion réussie",
        "token"      => $token,
        "first_name" => $user['first_name'],
        "last_name"  => $user['last_name']
    ]);
    exit;
}

// 👤 Récupérer les informations de l'utilisateur connecté
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getUser') {
    if (!isset($_SESSION['user_email'], $_SESSION['user_first_name'], $_SESSION['user_last_name'])) {
        echo json_encode(["success" => false, "message" => "Utilisateur non connecté"]);
        exit;
    }

    echo json_encode([
        "success"    => true,
        "email"      => $_SESSION['user_email'],
        "first_name" => $_SESSION['user_first_name'],
        "last_name"  => $_SESSION['user_last_name']
    ]);
    exit;
}

// 🚪 Déconnexion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'logout') {
    session_destroy();
    echo json_encode(["message" => "Déconnexion réussie"]);
    exit;
}

// 🚨 Action inconnue
echo json_encode(["error" => "Action non reconnue"]);
?>
