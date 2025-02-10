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
    // Récupérer toutes les compétences avec les informations de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT skills.id, skills.skill_name, users.first_name, users.last_name
        FROM skills
        JOIN users ON skills.user_id = users.id
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $action = $input['action'] ?? null;
    
    if ($action === 'add') {
        $skill_name     = trim($input['skill_name'] ?? '');
        $skill_category = trim($input['skill_category'] ?? '');
        
        if (empty($skill_name) || empty($skill_category)) {
            echo json_encode(["error" => "Le nom de la compétence et la catégorie sont requis"]);
            exit;
        }
        
        // Combiner le nom et la catégorie pour stocker dans la table skills
        $full_skill = $skill_name . " (" . $skill_category . ")";
        
        $stmt = $pdo->prepare("INSERT INTO skills (skill_name, user_id) VALUES (?, ?)");
        if ($stmt->execute([$full_skill, $user_id])) {
            echo json_encode(["message" => "Compétence ajoutée avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de l'ajout de la compétence"]);
        }
        exit;
    } else {
        echo json_encode(["error" => "Action non reconnue"]);
        exit;
    }
}

// Si la méthode HTTP n'est pas supportée
echo json_encode(["error" => "Méthode non supportée"]);
exit;
?>
