<?php
header("Content-Type: application/octet-stream");
header("Content-Disposition: attachment; filename=rapport.txt");

echo "Rapport généré le " . date("d/m/Y") . "\n";
echo "----------------------------\n";
echo "Nom du projet : Exécution\n";
echo "Statut : En cours\n";
?>