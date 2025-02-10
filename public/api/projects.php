<?php
require __DIR__ . '/config.php';
header("Content-Type: application/json");
session_start();

// Pour toute action modifiant des données, on vérifie que l'utilisateur est connecté
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$action = $_GET['action'] ?? $input['action'] ?? null;

if (!$action) {
    echo json_encode(["error" => "Aucune action spécifiée"]);
    exit;
}

switch ($action) {

    // ------------------------------------------------------------------
    // Récupérer tous les projets pour le sélecteur (getAllProjects)
    // ------------------------------------------------------------------
    case 'getAllProjects':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // Récupérer les projets (au moins id et name)
            $stmt = $pdo->query("SELECT id, name FROM projects ORDER BY id DESC");
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($projects);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;
    
    // ------------------------------------------------------------------
    // Récupérer tous les projets (getProjects)
    // ------------------------------------------------------------------
    case 'getProjects':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query("SELECT * FROM projects ORDER BY id DESC");
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($projects);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;

    // ------------------------------------------------------------------
    // Récupérer un seul projet par ID
    // ------------------------------------------------------------------
    case 'getProjectById':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $projectId = intval($_GET['id'] ?? 0);
            if ($projectId <= 0) {
                echo json_encode(["error" => "ID de projet invalide"]);
                exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
            $stmt->execute([$projectId]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($project ? $project : ["error" => "Projet introuvable"]);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;

    // ------------------------------------------------------------------
    // Ajouter un projet
    // ------------------------------------------------------------------
    case 'addProject':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');
            $status = trim($input['status'] ?? 'en cours');
            $deadline = $input['deadline'] ?? null;
            $created_by = $_SESSION['user_id'];
            
            if (empty($name) || empty($description)) {
                echo json_encode(["error" => "Tous les champs sont requis"]);
                exit;
            }
            
            $stmt = $pdo->prepare("INSERT INTO projects (name, description, status, deadline, created_by) VALUES (?, ?, ?, ?, ?)");
            $success = $stmt->execute([$name, $description, $status, $deadline, $created_by]);
            
            echo json_encode([
                "success" => $success,
                "message" => $success ? "Projet ajouté !" : "Erreur d'ajout"
            ]);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;

    // ------------------------------------------------------------------
    // Modifier un projet
    // ------------------------------------------------------------------
    case 'updateProject':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = intval($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $description = trim($input['description'] ?? '');
            $status = trim($input['status'] ?? '');
            $deadline = trim($input['deadline'] ?? '');
            
            if ($id <= 0 || empty($name) || empty($description) || empty($status) || empty($deadline)) {
                echo json_encode(["error" => "Tous les champs sont requis"]);
                exit;
            }
            
            $stmt = $pdo->prepare("UPDATE projects SET name = ?, description = ?, status = ?, deadline = ? WHERE id = ?");
            $success = $stmt->execute([$name, $description, $status, $deadline, $id]);
            
            echo json_encode($success
                ? ["message" => "Projet mis à jour"]
                : ["error" => "Erreur lors de la mise à jour"]);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;

    // ------------------------------------------------------------------
    // Supprimer un projet
    // ------------------------------------------------------------------
    case 'deleteProject':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = intval($input['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(["error" => "ID du projet requis"]);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $success = $stmt->execute([$id]);
            echo json_encode([
                "success" => $success,
                "message" => $success ? "Projet supprimé !" : "Erreur de suppression"
            ]);
        } else {
            echo json_encode(["error" => "Méthode non autorisée pour cette action"]);
        }
        break;

    default:
        echo json_encode(["error" => "Action non reconnue"]);
        break;
}
exit;
?>
