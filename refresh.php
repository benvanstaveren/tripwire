<?php
//	======================================================
//	File:		signatures.php
//	Author:		Josh Glassmaker (Daimian Mercer)
//	
//	======================================================

// Verify access via Tripwire signon
if (!session_id()) session_start();

if(!isset($_SESSION['userID'])) {
	exit();
}

header('Content-Type: application/json');
$startTime = microtime(true);

require('db.inc.php');

/**
// *********************
// Check and update session
// *********************
*/
$query = 'SELECT characterID, characterName, corporationID, corporationName, admin FROM characters WHERE userID = :userID';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
$stmt->execute();
if ($row = $stmt->fetchObject()) {
	$_SESSION['characterID'] = $row->characterID;
	$_SESSION['characterName'] = $row->characterName;
	$_SESSION['corporationID'] = $row->corporationID;
	$_SESSION['corporationName'] = $row->corporationName;
	$_SESSION['admin'] = $row->admin;
}

/**
// *********************
// Mask Check
// *********************
**/
$checkMask = explode('.', $_SESSION['mask']);
if ($checkMask[1] == 0 && $checkMask[0] != 0) {
	// Check custom mask
	$query = 'SELECT masks.maskID FROM masks INNER JOIN groups ON masks.maskID = groups.maskID WHERE masks.maskID = :maskID AND ((ownerID = :characterID AND ownerType = 1373) OR (ownerID = :corporationID AND ownerType = 2) OR (eveID = :characterID AND eveType = 1373) OR (eveID = :corporationID AND eveType = 2))';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':characterID', $_SESSION['characterID'], PDO::PARAM_INT);
	$stmt->bindValue(':corporationID', $_SESSION['corporationID'], PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $_SESSION['mask'], PDO::PARAM_STR);

	if ($stmt->execute() && $stmt->fetchColumn(0) != $_SESSION['mask'])
		$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
} else if ($checkMask[1] == 1 && $checkMask[0] != $_SESSION['characterID']) {
	// Force current character mask
	$_SESSION['mask'] = $_SESSION['characterID'] . '.1';
} else if ($checkMask[1] == 2 && $checkMask[0] != $_SESSION['corporationID']) {
	// Force current corporation mask
	$_SESSION['mask'] = $_SESSION['corporationID'] . '.2';
}

/**
// *********************
// EVE IGB Headers
// *********************
*/
if (isset($_SERVER['HTTP_EVE_TRUSTED']) && $_SERVER['HTTP_EVE_TRUSTED'] == 'Yes') {
	$headers['systemID'] = 			$_SERVER['HTTP_EVE_SOLARSYSTEMID'];
	$headers['systemName'] = 		$_SERVER['HTTP_EVE_SOLARSYSTEMNAME'];
	$headers['constellationID'] = 	isset($_SERVER['HTTP_EVE_CONSTELLATIONID'])?$_SERVER['HTTP_EVE_CONSTELLATIONID']:null;
	$headers['constellationName'] =	isset($_SERVER['HTTP_EVE_CONSTELLATIONNAME'])?$_SERVER['HTTP_EVE_CONSTELLATIONNAME']:null;
	$headers['regionID'] = 			$_SERVER['HTTP_EVE_REGIONID'];
	$headers['regionName'] = 		$_SERVER['HTTP_EVE_REGIONNAME'];
	$headers['stationID'] =			isset($_SERVER['HTTP_EVE_STATIONID'])?$_SERVER['HTTP_EVE_STATIONID']:null;
	$headers['stationName'] =		isset($_SERVER['HTTP_EVE_STATIONNAME'])?$_SERVER['HTTP_EVE_STATIONNAME']:null;
	$headers['characterID'] =		isset($_SERVER['HTTP_EVE_CHARID'])?$_SERVER['HTTP_EVE_CHARID']:null;
	$headers['characterName'] =		isset($_SERVER['HTTP_EVE_CHARNAME'])?$_SERVER['HTTP_EVE_CHARNAME']:null;
	$headers['corporationID'] =		isset($_SERVER['HTTP_EVE_CORPID'])?$_SERVER['HTTP_EVE_CORPID']:null;
	$headers['corporationName'] =	isset($_SERVER['HTTP_EVE_CORPNAME'])?$_SERVER['HTTP_EVE_CORPNAME']:null;
	$headers['allianceID'] =		isset($_SERVER['HTTP_EVE_ALLIANCEID'])?$_SERVER['HTTP_EVE_ALLIANCEID']:null;
	$headers['allianceName'] =		isset($_SERVER['HTTP_EVE_ALLIANCENAME'])?$_SERVER['HTTP_EVE_ALLIANCENAME']:null;
	$headers['shipID'] =			isset($_SERVER['HTTP_EVE_SHIPID'])?$_SERVER['HTTP_EVE_SHIPID']:null;
	$headers['shipName'] =			isset($_SERVER['HTTP_EVE_SHIPNAME'])?$_SERVER['HTTP_EVE_SHIPNAME']:null;
	$headers['shipTypeID'] =		isset($_SERVER['HTTP_EVE_SHIPTYPEID'])?$_SERVER['HTTP_EVE_SHIPTYPEID']:null;
	$headers['shipTypeName'] =		isset($_SERVER['HTTP_EVE_SHIPTYPENAME'])?$_SERVER['HTTP_EVE_SHIPTYPENAME']:null;

	$output['EVE'] = $headers;

	// Monitor current INGAME position
	if (isset($_SESSION['currentSystem']) && $_SESSION['currentSystem'] != $headers['systemName']) {
		$_SESSION['currentSystem'] = $headers['systemName'];

		$query = 'INSERT INTO systemVisits (systemID, userID) VALUES (:systemID, :userID) ON DUPLICATE KEY UPDATE date = NOW()';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
		$stmt->bindValue(':systemID', $headers['systemID'], PDO::PARAM_INT);
		$stmt->execute();

		$query = 'UPDATE userStats SET systemsVisited = systemsVisited + 1 WHERE userID = :userID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
		$stmt->execute();
	} else {
		$_SESSION['currentSystem'] = $headers['systemName'];
	}
} else {
	$query = 'SELECT characterID, characterName, systemID, systemName, shipID, shipName, shipTypeID, shipTypeName, stationID, stationName FROM active WHERE userID = :userID AND maskID = :maskID AND characterID IS NOT NULL LIMIT 1';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':userID', $_SESSION['userID'], PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $_SESSION['mask'], PDO::PARAM_STR);
	$stmt->execute();

	if ($row = $stmt->fetchObject())
		$output['EVE'] = $row;
}

session_write_close();

/**
// *********************
// Core variables
// *********************
*/
$ip				= isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : die();
$instance		= isset($_REQUEST['instance']) ? $_REQUEST['instance'] : 0;
$version		= isset($_SERVER['SERVER_NAME'])? explode('.', $_SERVER['SERVER_NAME'])[0] : die();
$userID			= isset($_SESSION['userID']) ? $_SESSION['userID'] : die();
$maskID			= isset($_SESSION['mask']) ? $_SESSION['mask'] : die();
$characterID 	= isset($headers['characterID']) ? $headers['characterID'] : null;
$characterName 	= isset($headers['characterName']) ? $headers['characterName'] : null;
$systemID 		= isset($headers['systemID']) ? $headers['systemID'] : null;
$systemName 	= isset($headers['systemName']) ? $headers['systemName'] : null;
$shipID 		= isset($headers['shipID']) ? $headers['shipID'] : null;
$shipName 		= isset($headers['shipName']) ? $headers['shipName'] : null;
$shipTypeID 	= isset($headers['shipTypeID']) ? $headers['shipTypeID'] : null;
$shipTypeName 	= isset($headers['shipTypeName']) ? $headers['shipTypeName'] : null;
$stationID 		= isset($headers['stationID']) ? $headers['stationID'] : null;
$stationName 	= isset($headers['stationName']) ? $headers['stationName'] : null;
$activity 		= isset($_REQUEST['activity']) ? json_encode($_REQUEST['activity']) : null;
$refresh 		= array('sigUpdate' => false, 'chainUpdate' => false);

/**
// *********************
// Active Tracking
// *********************
*/
// Notification
$query = 'SELECT notify FROM active WHERE instance = :instance AND notify IS NOT NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->execute();
$stmt->rowCount() ? $output['notify'] = $stmt->fetchColumn() : null;

$query = 'INSERT INTO active (ip, instance, session, userID, maskID, characterID, characterName, systemID, systemName, shipID, shipName, shipTypeID, shipTypeName, stationID, stationName, activity, version)
			VALUES (:ip, :instance, :session, :userID, :maskID, :characterID, :characterName, :systemID, :systemName, :shipID, :shipName, :shipTypeID, :shipTypeName, :stationID, :stationName, :activity, :version)
			ON DUPLICATE KEY UPDATE
			maskID = :maskID, characterID = :characterID, characterName = :characterName, systemID = :systemID, systemName = :systemName, shipID = :shipID, shipName = :shipName, shipTypeID = :shipTypeID, shipTypeName = :shipTypeName, stationID = :stationID, stationName = :stationName, activity = :activity, version = :version, time = NOW(), notify = NULL';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->bindValue(':session', session_id(), PDO::PARAM_STR);
$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
$stmt->bindValue(':characterID', $characterID, PDO::PARAM_INT);
$stmt->bindValue(':characterName', $characterName, PDO::PARAM_STR);
$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
$stmt->bindValue(':systemName', $systemName, PDO::PARAM_STR);
$stmt->bindValue(':shipID', $shipID, PDO::PARAM_INT);
$stmt->bindValue(':shipName', $shipName, PDO::PARAM_STR);
$stmt->bindValue(':shipTypeID', $shipTypeID, PDO::PARAM_INT);
$stmt->bindValue(':shipTypeName', $shipTypeName, PDO::PARAM_STR);
$stmt->bindValue(':stationID', $stationID, PDO::PARAM_INT);
$stmt->bindValue(':stationName', $stationName, PDO::PARAM_STR);
$stmt->bindValue(':activity', $activity, PDO::PARAM_STR);
$stmt->bindValue(':version', $version, PDO::PARAM_STR);
$stmt->execute();

$query = 'SELECT characters.characterName, activity FROM active INNER JOIN characters ON active.userID = characters.userID WHERE maskID = :maskID AND instance <> :instance AND activity IS NOT NULL AND activity <> ""';
$stmt = $mysql->prepare($query);
$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
$stmt->bindValue(':instance', $instance, PDO::PARAM_STR);
$stmt->execute();
$stmt->rowCount() ? $output['activity'] = $stmt->fetchAll(PDO::FETCH_OBJ) : null;


// *********************
// Signatures update
// *********************

require('signatures.php');
$signatures = new signatures();
$data = isset($_REQUEST['request']) ? json_decode(json_encode($_REQUEST['request'])) : null;
//$data = json_decode(file_get_contents('php://input'));

if ($data) {
	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'rename') && $data->signatures->rename != null)
		$output['result'] = $signatures->rename($data->signatures->rename);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'delete') && $data->signatures->delete != null)
		$output['result'] = $signatures->delete($data->signatures->delete);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'add') && $data->signatures->add != null)
		$output['result'] = $signatures->add($data->signatures->add);

	if (property_exists($data, 'signatures') && property_exists($data->signatures, 'update') && $data->signatures->update != null)
		$output['result'] = $signatures->update($data->signatures->update);
}

if (isset($_REQUEST['mode']) && $_REQUEST['mode'] == 'init') {
	$output['signatures'] = Array();
	$systemID = $_REQUEST['systemID'];

	$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	while ($row = $stmt->fetchObject()) {
		$row->lifeTime = date('m/d/Y H:i:s e', strtotime($row->lifeTime));
		$row->lifeLeft = date('m/d/Y H:i:s e', strtotime($row->lifeLeft));
		//$row->time = date('m/d/Y H:i:s e', strtotime($row->time));

		$output['signatures'][$row->id] = $row;
	}

	// Send server time for time sync
	$now = new DateTime();
	//$now->sub(new DateInterval('PT300S')); // Set clock 300 secounds behind
	$output['sync'] = $now->format("m/d/Y H:i:s e");

	// Grab chain map data
	$query = "SELECT DISTINCT signatures.id, signatureID, system, systemID, connection, connectionID, sig2ID, type, nth, sig2Type, nth2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))";
	#$query = "SELECT DISTINCT signatures.id, signatureID, system, CASE WHEN signatures.systemID = 0 THEN signatures.id ELSE signatures.systemID END AS systemID, connection, CASE WHEN connectionID IS NULL OR connectionID = 0 THEN signatures.id ELSE connectionID END AS connectionID, sig2ID, type, nth, sig2Type, nth2, class1.class, class2.class AS class2, (SELECT security FROM $eve_dump.mapSolarSystems WHERE solarSystemID = signatures.systemID) AS security, (SELECT security FROM $eve_dump.mapSolarSystems WHERE solarSystemID = connectionID) AS security2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM FROM signatures LEFT JOIN systems class1 ON class1.systemID = signatures.systemID LEFT JOIN systems class2 ON class2.systemID = connectionID WHERE life IS NOT NULL AND mask = :mask";
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	$output['chain']['map'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// System activity indicators
	$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND (mask = :mask OR ((sigs.systemID = 31000005 OR sigs.connectionID = 31000005) AND mask = 273))';
	#$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	$output['chain']['activity'] = $stmt->fetchAll(PDO::FETCH_CLASS);

	// Chain last modified
	$query = 'SELECT MAX(time) AS last_modified FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))';
	#$query = 'SELECT MAX(time) AS last_modified FROM signatures WHERE life IS NOT NULL AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$output['chain']['last_modified'] = $stmt->rowCount() ? $stmt->fetchColumn() : date('Y-m-d H:i:s', time());

	// Get occupied systems
	$query = 'SELECT DISTINCT systemID FROM active WHERE maskID = :maskID AND systemID IS NOT NULL';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$output['chain']['occupied'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

	// Get flares
	$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_INT);
	$stmt->execute();
	$result = $stmt->fetchAll(PDO::FETCH_CLASS);
	$output['chain']['flares']['flares'] = $result;
	$output['chain']['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());

	// Get Comments
	$query = 'SELECT id, comment, DATE_FORMAT(created, \'%m/%d/%Y %H:%i:%s\') AS createdDate, c.characterName AS createdBy, DATE_FORMAT(modified, \'%m/%d/%Y %H:%i:%s\') AS modifiedDate, m.characterName AS modifiedBy, systemID FROM comments LEFT JOIN characters c ON createdBy = c.characterID LEFT JOIN characters m ON modifiedBy = m.characterID WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	while ($row = $stmt->fetchObject()) {
		$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdBy' => $row->createdBy, 'modified' => $row->modifiedDate, 'modifiedBy' => $row->modifiedBy, 'sticky' => $row->systemID == 0 ? true : false);
	}
} else if ((isset($_REQUEST['mode']) && ($_REQUEST['mode'] == 'refresh') || $refresh['sigUpdate'] == true || $refresh['chainUpdate'] == true)) {
	$sigCount 		= isset($_REQUEST['sigCount']) ? $_REQUEST['sigCount'] : null;
	$sigTime 		= isset($_REQUEST['sigTime']) ? $_REQUEST['sigTime'] : null;
	$chainCount = isset($_REQUEST['chainCount'])?$_REQUEST['chainCount']:null;
	$chainTime = isset($_REQUEST['chainTime'])?$_REQUEST['chainTime']:null;
	$flareCount = isset($_REQUEST['flareCount'])?$_REQUEST['flareCount']:null;
	$flareTime = isset($_REQUEST['flareTime'])?$_REQUEST['flareTime']:null;
	$commentCount = isset($_REQUEST['commentCount'])?$_REQUEST['commentCount']:null;
	$commentTime = isset($_REQUEST['commentTime'])?$_REQUEST['commentTime']:null;
	$systemID = isset($_REQUEST['systemID'])?$_REQUEST['systemID']:$data->systemID;

	// Check if signatures changed....
	$query = 'SELECT COUNT(id) AS count, MAX(time) AS modified FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
	$stmt->execute();

	$row = $stmt->fetchObject();
	if ($sigCount != (int)$row->count || strtotime($sigTime) < strtotime($row->modified)) {
		$refresh['sigUpdate'] = true;
	}

	if ($refresh['sigUpdate'] == true) {
		$output['signatures'] = Array();

		$query = 'SELECT * FROM signatures WHERE (systemID = :systemID OR connectionID = :systemID) AND mask = :mask';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();

		while ($row = $stmt->fetchObject()) {
			$row->lifeTime = date('m/d/Y H:i:s e', strtotime($row->lifeTime));
			$row->lifeLeft = date('m/d/Y H:i:s e', strtotime($row->lifeLeft));
			//$row->time = date('m/d/Y H:i:s e', strtotime($row->time));

			$output['signatures'][$row->id] = $row;
		}
	}
	
	// Check if chain changed....
	if ($chainCount !== null && $chainTime !== null) {
		$query = 'SELECT COUNT(id) AS chainCount, MAX(time) as chainTime FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();
		$row = $stmt->fetchObject();

		if ($row && $row->chainCount != $chainCount) {
			$refresh['chainUpdate'] = true;
		} else if ($row && $row->chainTime && $row->chainTime != $chainTime) {
			$refresh['chainUpdate'] = true;
		}
	}

	if ($refresh['chainUpdate'] == true) {
		$output['chain']['map'] = Array();

		$query = "SELECT DISTINCT signatures.id, signatureID, system, systemID, connection, connectionID, sig2ID, type, nth, sig2Type, nth2, lifeLength, life, mass, time, typeBM, type2BM, classBM, class2BM FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))";
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
		$stmt->execute();

		$output['chain']['map'] = $stmt->fetchAll(PDO::FETCH_CLASS);

		// System activity indicators
		$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills FROM signatures sigs INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL AND (mask = :mask OR ((sigs.systemID = 31000005 OR sigs.connectionID = 31000005) AND mask = 273))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_INT);
		$stmt->execute();

		$output['chain']['activity'] = $stmt->fetchAll(PDO::FETCH_CLASS);

		$query = 'SELECT MAX(time) AS last_modified FROM signatures WHERE life IS NOT NULL AND (mask = :mask OR ((signatures.systemID = 31000005 OR signatures.connectionID = 31000005) AND mask = 273))';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':mask', $maskID, PDO::PARAM_STR);
		$stmt->execute();

		$output['chain']['last_modified'] = $stmt->fetchColumn();
	}

	// Get flares
	if (isset($output['chain']) || ($flareCount != null && $flareTime != null)) {
		$query = 'SELECT systemID, flare, time FROM flares WHERE maskID = :maskID ORDER BY time DESC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_INT);
		$stmt->execute();
		$result = $stmt->fetchAll(PDO::FETCH_CLASS);
		if (isset($output['chain']) || (count($result) != $flareCount || ($result && strtotime($result[0]->time) < strtotime($flareTime)))) {
			$output['chain']['flares']['flares'] = $result;
			$output['chain']['flares']['last_modified'] = date('m/d/Y H:i:s e', $result ? strtotime($result[0]->time) : time());
		}
	}

	// Get occupied systems
	$query = 'SELECT DISTINCT systemID FROM active WHERE maskID = :maskID AND systemID IS NOT NULL';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	if ($result = $stmt->fetchAll(PDO::FETCH_COLUMN))
		$output['chain']['occupied'] = $result;

	// Check Comments
	$query = 'SELECT COUNT(id) AS count, MAX(modified) AS modified FROM comments WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$stmt->execute();
	$row = $stmt->fetch(PDO::FETCH_OBJ);
	if ($commentCount != (int)$row->count || strtotime($commentTime) < strtotime($row->modified)) {
		$output['comments'] = array();
		// Get Comments
		$query = 'SELECT id, comment, DATE_FORMAT(created, \'%m/%d/%Y %H:%i:%s\') AS createdDate, c.characterName AS createdBy, DATE_FORMAT(modified, \'%m/%d/%Y %H:%i:%s\') AS modifiedDate, m.characterName AS modifiedBy, systemID FROM comments LEFT JOIN characters c ON createdBy = c.characterID LEFT JOIN characters m ON modifiedBy = m.characterID WHERE (systemID = :systemID OR systemID = 0) AND maskID = :maskID ORDER BY systemID ASC, modified ASC';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
		$stmt->execute();
		while ($row = $stmt->fetchObject()) {
			$output['comments'][] = array('id' => $row->id, 'comment' => $row->comment, 'created' => $row->createdDate, 'createdBy' => $row->createdBy, 'modified' => $row->modifiedDate, 'modifiedBy' => $row->modifiedBy, 'sticky' => $row->systemID == 0 ? true : false);
		}
	}
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);

?>


