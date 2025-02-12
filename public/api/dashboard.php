<?php
require __DIR__ . '/config.php';
header("Content-Type: application/json");
// Désactiver le cache pour forcer le rafraîchissement
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
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
        // Retourner le dernier projet de l'utilisateur
        $stmt = $pdo->prepare("SELECT id, name, description, status, deadline FROM projects WHERE created_by = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'getTasks':
        // Retourner la dernière tâche non terminée de l'utilisateur (ou liée à ses projets)
        $stmt = $pdo->prepare("
            SELECT t.id, t.title, t.description, t.status, t.due_date, p.name AS project_name, p.id AS project_id
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE (t.assigned_to = ? OR p.created_by = ?) AND t.status != 'terminé'
            ORDER BY t.id DESC LIMIT 1
        ");
        $stmt->execute([$user_id, $user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    
    case 'getCollaborators':
        $stmt = $pdo->prepare("
            SELECT DISTINCT u.id, u.first_name, u.last_name
            FROM users u
            JOIN tasks t ON u.id = t.assigned_to
            WHERE t.project_id IN (
                SELECT project_id FROM tasks WHERE assigned_to = ?
            )
            AND u.id != ?
            ORDER BY u.id DESC
        ");
        $stmt->execute([$user_id, $user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'getSkills':
        $stmt = $pdo->prepare("SELECT id, skill_name, category FROM skills WHERE user_id = ? ORDER BY id DESC");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'getProjectStatusCounts':
        // Retourner le nombre de projets par statut pour l'utilisateur
        $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM projects WHERE created_by = ? GROUP BY status");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    default:
        echo json_encode(["error" => "Action non reconnue"]);
        break;
}
exit;
?>
