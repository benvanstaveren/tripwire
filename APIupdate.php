<?php
//	======================================================
//	File:		signatures.php
//	Author:		Josh Glassmaker (Daimian Mercer)
//	
//	======================================================

// Verify access via Tripwire signon
if (!session_id()) session_start();

require('db.inc.php');

if (isset($_REQUEST['init'])) {
	$query = 'SELECT time FROM eve_api.cacheTime WHERE type = "activity"';
	$stmt = $mysql->prepare($query);
	$stmt->execute();
	$row = $stmt->fetchObject();

	$time = strtotime($row->time) + 3600;
	$output['APIrefresh'] = date('m/d/Y H:i:s e', $time);
	$cache = $time < time() ? 10 : ($time - time()) - 30;

	$output['indicator'] = $time;
} else if (isset($_REQUEST['indicator'])) {
	$query = 'SELECT time FROM eve_api.cacheTime WHERE type = "activity"';
	$stmt = $mysql->prepare($query);
	$stmt->execute();
	$row = $stmt->fetchObject();

	if ($row && isset($_REQUEST['indicator']) && $_REQUEST['indicator'] < strtotime($row->time) + 3600) {
		$time = strtotime($row->time) + 3600;
		$output['APIrefresh'] = date('m/d/Y H:i:s e', $time);
		$cache = $time < time() ? 10 : ($time - time()) - 30;

		$output['indicator'] = $time;

		if (isset($_SESSION['authorization'])) {
			// System activity indicators
			$query = 'SELECT DISTINCT api.systemID, shipJumps, podKills, shipKills, npcKills FROM signatures sigs INNER JOIN masks ON mask = maskID AND accessID = :access INNER JOIN eve_api.recentActivity api ON connectionID = api.systemID OR sigs.systemID = api.systemID WHERE life IS NOT NULL';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':access', $_SESSION['authorization'], PDO::PARAM_INT);
			$stmt->execute();

			$output['chain']['activity'] = $stmt->fetchAll(PDO::FETCH_CLASS);
		}
	} else {
		$cache = 0;
		$output['result'] = false;
	}
}

header('Cache-Control: max-age='.$cache);
header('Expires: '.gmdate('r', time() + $cache));
header('Pragma: cache');
header('Content-Type: application/json');

echo json_encode($output);
?>