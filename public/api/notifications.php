<?php
require __DIR__ . '/config.php';



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'];
    $message = $_POST['message'];

    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
    $stmt->execute([$user_id, $message]);
    echo json_encode(["status" => "Notification envoyée"]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT message FROM notifications ORDER BY created_at DESC LIMIT 10");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>