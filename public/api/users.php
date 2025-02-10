<?php
require __DIR__ . '/config.php';
require __DIR__ . '/session.php'; // 🔹 Inclusion de la gestion des sessions

// 🔹 Vérifier que l'utilisateur est connecté et qu'il est admin
function checkRole($user_id, $required_role) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user && $user['role'] === $required_role;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['set_role'])) {
    $admin_id = $_SESSION['user_id'] ?? null;
    $user_id = $_POST['user_id'] ?? null;
    $new_role = $_POST['role'] ?? '';

    if (!$admin_id || !$user_id || !$new_role) {
        echo json_encode(["error" => "Paramètres manquants"]);
        exit;
    }

    if (!checkRole($admin_id, 'admin')) {
        echo json_encode(["error" => "Accès refusé"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
    if ($stmt->execute([$new_role, $user_id])) {
        echo json_encode(["message" => "Rôle mis à jour"]);
    } else {
        echo json_encode(["error" => "Erreur lors de la mise à jour"]);
    }
}
?>