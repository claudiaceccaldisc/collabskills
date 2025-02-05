<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit();
}

require_once "config.php";

$user_id = $_SESSION['user_id'];
$query = $pdo->prepare("SELECT prenom, nom FROM utilisateurs WHERE id = :id");
$query->execute(['id' => $user_id]);
$user = $query->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["prenom" => $user['prenom'], "nom" => $user['nom']]);
} else {
    echo json_encode(["error" => "Utilisateur introuvable"]);
}
?>
