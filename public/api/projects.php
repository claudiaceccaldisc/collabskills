<?php
require __DIR__ . '/config.php';

// Assure-toi que la connexion à la base est bien établie
header("Content-Type: application/json");
session_start();

$input = json_decode(file_get_contents("php://input"), true);

if (!$input && !isset($_GET['action'])) {
    echo json_encode(["error" => "Requête invalide"]);
    exit;
}

$action = $_GET['action'] ?? $input['action'] ?? null;

// 🎯 Récupérer tous les projets
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'getProjects') {
    $stmt = $pdo->query("SELECT * FROM projects ORDER BY id DESC");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($projects);
    exit;
}

// Récupérer un seul projet par ID
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProjectById') {
    $projectId = intval($_GET['id']);
    
    if ($projectId <= 0) {
        echo json_encode(["error" => "ID de projet invalide"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
    $stmt->execute([$projectId]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($project) {
        echo json_encode($project);
    } else {
        echo json_encode(["error" => "Projet introuvable"]);
    }
    exit;
}


// 🎯 Ajouter un projet
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'addProject') {
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $status = $input['status'] ?? 'en cours';
    $deadline = $input['deadline'] ?? null;
    $created_by = $_SESSION['user_id'] ?? 1; // Change cette valeur en fonction de la session

    if (empty($name) || empty($description)) {
        echo json_encode(["error" => "Tous les champs sont requis"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO projects (name, description, status, deadline, created_by) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([$name, $description, $status, $deadline, $created_by]);

    echo json_encode(["success" => $success, "message" => $success ? "Projet ajouté !" : "Erreur d'ajout"]);
    exit;
}

// Gérer la modification d'un projet
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input['action'] === 'updateProject') {
    $id = intval($input['id']);
    $name = trim($input['name']);
    $description = trim($input['description']);
    $status = trim($input['status']);
    $deadline = trim($input['deadline']);

    if (empty($id) || empty($name) || empty($description) || empty($status) || empty($deadline)) {
        echo json_encode(["error" => "Tous les champs sont requis"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE projects SET name=?, description=?, status=?, deadline=? WHERE id=?");
    $success = $stmt->execute([$name, $description, $status, $deadline, $id]);

    if ($success) {
        echo json_encode(["message" => "Projet mis à jour"]);
    } else {
        echo json_encode(["error" => "Erreur lors de la mise à jour"]);
    }
    exit;
}


// 🎯 Supprimer un projet
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'deleteProject') {
    $id = $input['id'] ?? null;

    if (!$id) {
        echo json_encode(["error" => "ID du projet requis"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
    $success = $stmt->execute([$id]);

    echo json_encode(["success" => $success, "message" => $success ? "Projet supprimé !" : "Erreur de suppression"]);
    exit;
}

echo json_encode(["error" => "Action non reconnue"]);
?>