<?php
require __DIR__ . '/config.php';

header("Content-Type: application/json");

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT skills.id, skills.skill_name, users.first_name, users.last_name
        FROM skills
        JOIN users ON skills.user_id = users.id
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
?>
