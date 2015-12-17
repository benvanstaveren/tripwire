<?php

if (!session_id()) session_start();
session_write_close();

// Check for login & admin permission - else kick
if(!isset($_SESSION['userID']) || !isset($_SESSION['admin'])){
	exit();
}

require('db.inc.php');

header('Content-Type: application/json');

$mode = isset($_REQUEST['mode']) ? $_REQUEST['mode'] : null;
$mask = $_SESSION['mask'];
$output = null;

if ($mode == 'active-users') {
    $query = 'SELECT a.userID, c.characterID AS accountCharacterID, c.characterName AS accountCharacterName, a.characterID, a.characterName, systemID, systemName, shipName, shipTypeID, shipTypeName, stationID, stationName FROM active a INNER JOIN characters c ON a.userID = c.userID WHERE maskID = :mask';
    $stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
}

echo json_encode($output);
