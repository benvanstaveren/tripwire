<?php
//***********************************************************
//	File: 		server_status.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	2/14/2014 - Daimian
//
//	Purpose:	Handles pulling EVE server status & player count
//
//	ToDo:
//***********************************************************

require('db.inc.php');

header('Content-Type: application/json');

$query = 'SELECT players, status AS online, time FROM eve_api.serverStatus ORDER BY time DESC LIMIT 1';
$stmt = $mysql->prepare($query);
$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_CLASS);
if ($result) {
	$result[0]->time = strtotime($result[0]->time) - time() + 180;
}

echo json_encode($result[0]);
