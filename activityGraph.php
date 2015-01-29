<?php
//***********************************************************
//	File: 		activityData.php
//	Author: 	Daimian
//	Created: 	6/1/2013
//	Modified: 	2/13/2014 - Daimian
//
//	Purpose:	Handles getting activity graph data.
//
//	ToDo:
//		Remove need to revese array
//		Remove need to include zeros
//***********************************************************

$startTime = microtime(true);
ob_start("ob_gzhandler");

require('db.inc.php');

$query = 'SELECT time FROM eve_api.cacheTime WHERE type = "activity"';
$stmt = $mysql->prepare($query);
$stmt->execute();
$row = $stmt->fetchObject();
$cache = $row->time ? ((strtotime($row->time) + 3600) - time()) / 2 : 60;

header('Cache-Control: max-age='.$cache);
header('Expires: '.gmdate('r', time() + $cache));
header('Pragma: cache');
header('Content-Type: application/json');

$length = isset($_REQUEST['time']) && !empty($_REQUEST['time'])?$_REQUEST['time']:24;
$systemID = $_REQUEST['systemID'];

$query = 'SELECT shipJumps, shipKills, podKills, npcKills, time FROM eve_api.systemActivity WHERE systemID = :systemID ORDER BY time DESC LIMIT :limit';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
$stmt->bindValue(':limit', (int)$length + 1, PDO::PARAM_INT);
$stmt->execute();

$output['cols'][] = Array('type' => 'string');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');
$output['cols'][] = Array('type' => 'number');

$now = time();
$row = $stmt->fetchObject();
for ($x = 0; $x <= $length; $x++) {
	$data = null;

	if ($row && date('m/d/Y H', strtotime($row->time)) == date('m/d/Y H', $now - (3600 * $x))) {
		$data[] = Array('v' => $x);
		$data[] = Array('v' => (int)$row->shipJumps);
		$data[] = Array('v' => (int)$row->podKills);
		$data[] = Array('v' => (int)$row->shipKills);
		$data[] = Array('v' => (int)$row->npcKills);

		$row = $stmt->fetchObject();
	} else {
		$data[] = Array('v' => $x);
		$data[] = Array('v' => 0);
		$data[] = Array('v' => 0);
		$data[] = Array('v' => 0);
		$data[] = Array('v' => 0);
	}

	$output['rows'][]['c'] = $data;
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
ob_flush();

?>