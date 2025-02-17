<?php
require __DIR__ . '/config.php';
header("Content-Type: application/json");
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Utilisateur non connecté"]);
    exit;
}
$user_id = $_SESSION['user_id'];

// Traitement des requêtes GET
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    $action = $_GET['action'];
    
    if ($action === 'getTasks') {
        // Récupérer toutes les tâches assignées à l'utilisateur
        $stmt = $pdo->prepare("SELECT t.*, p.name AS project_name FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.assigned_to = ?");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    else if ($action === 'getTaskSummary' && isset($_GET['project_id'])) {
        $project_id = $_GET['project_id'];
        // Récupérer les 5 dernières tâches pour le projet donné avec statut "à faire" ou "en cours"
        $stmt = $pdo->prepare("SELECT t.*, p.name AS project_name FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.project_id = ? AND t.status IN ('à faire', 'en cours') ORDER BY t.id DESC LIMIT 5");
        $stmt->execute([$project_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
    else if ($action === 'getTaskCounts') {
        // Récupérer le nombre de tâches par statut pour l'utilisateur connecté
        $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM tasks WHERE assigned_to = ? GROUP BY status");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }
}

// Traitement des requêtes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $action = $input['action'] ?? null;
    
    if ($action === 'addTask') {
        $project_id  = trim($input['project_id'] ?? '');
        $title       = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $due_date    = trim($input['due_date'] ?? '');
        $status      = trim($input['status'] ?? 'à faire');

        if (empty($project_id) || empty($title) || empty($due_date) || empty($status)) {
            echo json_encode(["error" => "Les champs projet, titre, date d'échéance et statut sont requis"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO tasks (project_id, title, description, assigned_to, status, due_date) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt->execute([$project_id, $title, $description, $user_id, $status, $due_date])) {
            echo json_encode(["message" => "Tâche ajoutée avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de l'ajout de la tâche"]);
        }
        exit;
    }
    else if ($action === 'updateTask') {
        $id          = trim($input['id'] ?? '');
        $project_id  = trim($input['project_id'] ?? '');
        $title       = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $due_date    = trim($input['due_date'] ?? '');
        $status      = trim($input['status'] ?? '');

        if (empty($id) || empty($project_id) || empty($title) || empty($due_date) || empty($status)) {
            echo json_encode(["error" => "Tous les champs sont requis pour la mise à jour"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE tasks SET project_id = ?, title = ?, description = ?, due_date = ?, status = ? WHERE id = ? AND assigned_to = ?");
        if ($stmt->execute([$project_id, $title, $description, $due_date, $status, $id, $user_id])) {
            echo json_encode(["message" => "Tâche mise à jour avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de la mise à jour de la tâche"]);
        }
        exit;
    }
    else if ($action === 'deleteTask') {
        $id = trim($input['id'] ?? '');
        if (empty($id)) {
            echo json_encode(["error" => "ID de tâche requis pour la suppression"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND assigned_to = ?");
        if ($stmt->execute([$id, $user_id])) {
            echo json_encode(["message" => "Tâche supprimée avec succès"]);
        } else {
            echo json_encode(["error" => "Erreur lors de la suppression de la tâche"]);
        }
        exit;
    }
}

echo json_encode(["error" => "Méthode non supportée ou action non reconnue"]);
exit;
?>
