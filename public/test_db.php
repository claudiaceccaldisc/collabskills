<?php
// Inclure la configuration de la base de données
require_once "../api/config.php";

header("Content-Type: text/html; charset=UTF-8");

try {
    echo "<h2>✅ Connexion réussie à la base de données !</h2>";

    // Vérifier si la table "users" existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "<p>Table <strong>users</strong> trouvée.</p>";

        // Récupérer les utilisateurs
        $stmt = $pdo->query("SELECT id, first_name, last_name, email FROM users LIMIT 10");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($users) {
            echo "<h3>📋 Liste des utilisateurs enregistrés :</h3><ul>";
            foreach ($users as $user) {
                echo "<li>ID: {$user['id']} | {$user['first_name']} {$user['last_name']} | Email: {$user['email']}</li>";
            }
            echo "</ul>";
        } else {
            echo "<p>⚠️ Aucun utilisateur trouvé dans la base de données.</p>";
        }
    } else {
        echo "<p>❌ La table <strong>users</strong> n'existe pas.</p>";
    }
} catch (PDOException $e) {
    echo "<p>❌ Erreur de connexion : " . $e->getMessage() . "</p>";
}
?>
