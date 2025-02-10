<?php
require __DIR__ . '/config.php';
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? null;

if (!$action) {
    echo json_encode(["error" => "Action non spécifiée"]);
    exit;
}

switch ($action) {
    case 'getProjects':
        // Récupérer les projets créés par l'utilisateur avec le statut 'en cours'
        $stmt = $pdo->prepare("SELECT id, name, description, status, deadline FROM projects WHERE created_by = ? AND status = 'en cours'");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'getTasks':
        // Récupérer les tâches assignées à l'utilisateur et non terminées
        $stmt = $pdo->prepare("SELECT id, title, description, status, due_date FROM tasks WHERE assigned_to = ? AND status != 'terminé'");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'getCollaborators':
        // Récupérer les collaborateurs travaillant sur des projets communs
        $stmt = $pdo->prepare("
            SELECT DISTINCT u.id, u.first_name, u.last_name
            FROM users u
            JOIN tasks t ON u.id = t.assigned_to
            WHERE t.project_id IN (
                SELECT project_id FROM tasks WHERE assigned_to = ?
            )
            AND u.id != ?
        ");
        $stmt->execute([$user_id, $user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
        case 'getSkills':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $stmt = $pdo->prepare("SELECT id, skill_name, category FROM skills WHERE user_id = ?");
                $stmt->execute([$_SESSION['user_id']]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
                exit;
            } else {
                echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
                exit;
            }
            break;
        
    
    default:
        echo json_encode(["error" => "Action non reconnue"]);
        break;
}
exit;
?>
