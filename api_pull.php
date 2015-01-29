<?php
ini_set('display_errors', 'On');

require('db.inc.php');
require('api.class.php');

date_default_timezone_set('UTC');

$startTime = microtime(true);

$time = date('Y-m-d H:i', time());
$output = null;

// Get server status
$url = 'https://api.eveonline.com/server/ServerStatus.xml.aspx';
if ($xml = @simplexml_load_file($url)) {
	$output['players'] = (int)$xml->result->onlinePlayers;
	$output['status'] = (int)$xml->result->serverOpen == 'True' && (int)$xml->result->onlinePlayers != 0 ? 1 : 0;

	$query = 'INSERT INTO eve_api.serverStatus (time, status, players) VALUES (:time, :status, :players)';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':time', $time, PDO::PARAM_STR);
	$stmt->bindValue(':status', $output['status'], PDO::PARAM_INT);
	$stmt->bindValue(':players', $output['players'], PDO::PARAM_INT);
	$stmt->execute();	
} else {
	$players = 0;
	$status = 0;

	$query = 'INSERT INTO eve_api.serverStatus (time, status, players) VALUES (:time, :status, :players)';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':time', $time, PDO::PARAM_STR);
	$stmt->bindValue(':status', $status, PDO::PARAM_INT);
	$stmt->bindValue(':players', $players, PDO::PARAM_INT);
	$stmt->execute();	
}

// Get activity
$query = "SELECT time FROM eve_api.cacheTime WHERE type = 'activity'";
$stmt = $mysql->prepare($query);
$stmt->execute();
$row = $stmt->fetchObject();
if (!$row || ($row && strtotime($row->time) + 3600 <= time())) {
	$activity = array();

	// Gather jump data
	$url = 'https://api.eveonline.com/map/Jumps.xml.aspx';
	if ($xml = @simplexml_load_file($url)) {
		foreach ($xml->result->rowset->row AS $row) {
			$activity[(int)$row['solarSystemID']]['shipJumps'] = (int)$row['shipJumps'];
		}

		$jumpCache = $xml->cachedUntil;
	}

	// Gather kill data
	$url = 'https://api.eveonline.com/map/Kills.xml.aspx';
	if ($xml = @simplexml_load_file($url)) {
		foreach ($xml->result->rowset->row AS $row) {
			$activity[(int)$row['solarSystemID']]['shipKills'] = (int)$row['shipKills'];
			$activity[(int)$row['solarSystemID']]['podKills'] = (int)$row['podKills'];
			$activity[(int)$row['solarSystemID']]['npcKills'] = (int)$row['factionKills'];
		}

		$killCache = $xml->cachedUntil;
	}

	// Output
	$csv = fopen(dirname(__FILE__).'/activity.csv', 'w');
	foreach ($activity AS $index => $line) {
		$data = Array(
					$index, 
					$time, 
					isset($line['shipJumps']) ? $line['shipJumps'] : 0,
					isset($line['shipKills']) ? $line['shipKills'] : 0, 
					isset($line['podKills']) ? $line['podKills'] : 0, 
					isset($line['npcKills']) ? $line['npcKills'] : 0
				);

		fputcsv($csv, $data);
	}
	fclose($csv);

	$query = 'UPDATE eve_api.recentActivity SET shipJumps = 0, shipKills = 0, podKills = 0, npcKills = 0';
	$stmt = $mysql->prepare($query);
	$stmt->execute();

	// Insert data
	$query = "LOAD DATA INFILE 'http://10.132.120.172/activity.csv' INTO TABLE eve_api.systemActivity FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n'";
	$stmt = $mysql->prepare($query);
	$stmt->execute();
	
	$query = 'INSERT INTO eve_api.cacheTime (time, type) VALUES (:time, "activity") ON DUPLICATE KEY UPDATE time = :time';
	//$query = 'UPDATE eve_api.cacheTime SET time = :time WHERE type = "activity"';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':time', $time, PDO::PARAM_STR);
	$stmt->execute();
}

// Check characters
$query = 'SELECT characterID FROM characters';
$stmt = $mysql->prepare($query);
$stmt->execute();
$chars = $stmt->fetchAll(PDO::FETCH_COLUMN);

if ($chars && count($chars) > 0) {
	$result = array();
	$API = new API();

	for ($x = 0, $l = count($chars); $x < $l; $x += 250) {
		$apiData = $API->getEveIds(implode(',', array_slice($chars, $x, 250)));

		if ($apiData != 0 && count($apiData) > 0)
			$result = array_merge($result, $apiData);
	}

	$query = 'UPDATE characters SET corporationID = :corporationID, corporationName = :corporationName, ban = 0, admin = 0 WHERE characterID = :characterID AND corporationID <> :corporationID';
	$stmt = $mysql->prepare($query);

	foreach ($result as $char) {
		$stmt->bindValue(':characterID', $char->characterID, PDO::PARAM_INT);
		$stmt->bindValue(':corporationID', $char->corporationID, PDO::PARAM_INT);
		$stmt->bindValue(':corporationName', $char->corporationName, PDO::PARAM_STR);
		$stmt->execute();
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

#echo json_encode($output);

?>