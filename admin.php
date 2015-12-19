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

function checkOwner($mask) {
	global $mysql;

	if ($mask == $_SESSION['characterID'].'.1') {
		return true;
	}
	return true;

	$query = 'SELECT maskID FROM masks WHERE ownerID = :ownerID AND ownerType = 1373 AND maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':ownerID', $_SESSION['characterID'], PDO::PARAM_INT);
	$stmt->bindValue(':mask', $mask, PDO::PARAM_INT);
	$stmt->execute();

	return $stmt->rowCount() == 0 ? false : true;
}

function checkAdmin($mask) {
	global $mysql;

	if ($mask == $_SESSION['corporationID'].'.2' && $_SESSION['admin'] == 1) {
		return $_SESSION['corporationID'];
	}

	$query = 'SELECT corporationID FROM characters INNER JOIN masks ON ownerID = corporationID AND ownerType = 2 WHERE characterID = :characterID AND admin = 1 AND maskID = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':characterID', $_SESSION['characterID'], PDO::PARAM_INT);
	$stmt->bindValue(':mask', $mask, PDO::PARAM_INT);
	$stmt->execute();

	return $stmt->rowCount() == 0 ? false : $stmt->fetchColumn(0);
}

if ($mode == 'active-users' && (checkOwner($mask) || checkAdmin($mask))) {
    $query = 'SELECT a.userID + instance AS id, c.characterID AS accountCharacterID, c.characterName AS accountCharacterName, a.characterID, a.characterName, systemID, systemName, shipName, shipTypeID, shipTypeName, stationID, stationName, lastLogin FROM active a INNER JOIN characters c ON a.userID = c.userID INNER JOIN userStats s ON a.userID = s.userID WHERE maskID = :mask';
    $stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask);
	$stmt->execute();

    $output['results'] = $stmt->fetchAll(PDO::FETCH_CLASS);
}

echo json_encode($output);
