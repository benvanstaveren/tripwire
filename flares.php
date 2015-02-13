<?php
//***********************************************************
//	File: 		flares.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	1/22/2014 - Daimian
//
//	Purpose:	Handles creating and removing system flares.
//
//	ToDo:
//
//***********************************************************
if (!session_id()) session_start();
session_write_close();

if(!isset($_SESSION['username'])) {
	exit();
}

$startTime = microtime(true);

require('db.inc.php');

header('Content-Type: application/json');

$mask = $_SESSION['mask'];

if (isset($_REQUEST['flare']) && !empty($_REQUEST['flare'])) {
	$systemID = $_REQUEST['systemID'];
	$flare = $_REQUEST['flare'];

	$query = 'INSERT INTO flares (maskID, systemID, flare) VALUES (:mask, :systemID, :flare) ON DUPLICATE KEY UPDATE flare = :flare';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask, PDO::PARAM_INT);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':flare', $flare, PDO::PARAM_STR);
	
	$output['result'] = $stmt->execute()?true:$stmt->errorInfo();
} else {
	$systemID = $_REQUEST['systemID'];

	$query = "DELETE FROM flares WHERE maskID = :mask AND systemID = :systemID";
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $mask, PDO::PARAM_INT);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	
	$output['result'] = $stmt->execute()?true:$stmt->errorInfo();
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
?>