<?php
session_start();
header("Content-Type: application/json");

// Inclusion de la configuration dès le début
require_once "config.php";

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Récupération des informations de l'utilisateur dans la base de données
$query = $pdo->prepare("SELECT first_name, last_name FROM users WHERE id = :id");
$query->execute(['id' => $user_id]);
$user = $query->fetch(PDO::FETCH_ASSOC);

// Envoi d'une seule réponse JSON
if ($user) {
    echo json_encode([
        "user_id"    => $user_id,
        "first_name" => $user['first_name'],
        "last_name"  => $user['last_name']
    ]);
} else {
    echo json_encode(["error" => "Utilisateur introuvable"]);
}
?>
