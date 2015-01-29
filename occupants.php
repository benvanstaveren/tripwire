<?php
//***********************************************************
//	File: 		occupants.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	1/22/2014 - Daimian
//
//	Purpose:	Handles pulling system occupants.
//
//	ToDo:
//
//***********************************************************
if (!session_id()) session_start();

if(!isset($_SESSION['username'])) {
	exit();
}

$startTime = microtime(true);

require('db.inc.php');

header('Content-Type: application/json');

$systemID = $_REQUEST['systemID'];
$maskID = $_SESSION['mask'];

$query = 'SELECT DISTINCT characterName, shipTypeName FROM active WHERE systemID = :systemID AND maskID = :maskID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
$stmt->execute();

$output['occupants'] = $stmt->fetchAll(PDO::FETCH_CLASS);

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
?>