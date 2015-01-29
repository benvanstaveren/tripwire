<?php
//***********************************************************
//	File: 		init.php
//	Author: 	Daimian
//	Created: 	4/25/2014
//	Modified: 	4/25/2014 - Daimian
//
//	Purpose:	Handles ...
//
//	ToDo:
//***********************************************************
if (!session_id()) session_start();

$startTime = microtime(true);

require('db.inc.php');

if (isset($_SERVER['HTTP_EVE_TRUSTED']) && $_SERVER['HTTP_EVE_TRUSTED'] == 'No')
	$output['trustCheck'] = true;

if (!isset($_SESSION['userID']) && isset($_COOKIE['userID']))
	include('login.php');
else
	$output['session'] = $_SESSION;

if (isset($_SESSION['userID'])) {
	$query = 'UPDATE userStats SET systemsViewed = systemsViewed + 1 WHERE userID = :userID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
	$stmt->execute();
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);

?>