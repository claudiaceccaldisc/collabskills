<?php
require __DIR__ . "/session.php"; // 🔹 Inclusion de la gestion des sessions

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}

$target_dir = "../uploads/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);

if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    echo json_encode(["message" => "Fichier uploadé avec succès"]);
} else {
    echo json_encode(["error" => "Erreur d'upload"]);
}
?>
