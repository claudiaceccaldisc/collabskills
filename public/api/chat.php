<?php
require __DIR__ . '/config.php';



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'];
    $message = $_POST['message'];
    
    $stmt = $pdo->prepare("INSERT INTO chat (user_id, message, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([$user_id, $message]);
    echo json_encode(["status" => "Message envoyé"]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT users.first_name, chat.message, chat.created_at FROM chat 
                         JOIN users ON chat.user_id = users.id ORDER BY chat.created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
