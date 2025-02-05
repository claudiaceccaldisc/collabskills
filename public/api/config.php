<?php
$host = "ss823922-001.eu.clouddb.ovh.net";
$dbname = "collabclaudia";
$user = "claudia";
$port = "35450"; 
$password = "Collabclaudia47";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connexion à la base de données échouée : " . $e->getMessage()]));
}
?>
