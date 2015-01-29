<?php
//***********************************************************
//	File: 		comments.php
//	Author: 	Daimian
//	Created: 	12/08/2014
//	Modified: 	12/12/2014 - Daimian
//
//	Purpose:	Handles saving/editing/deleting comments.
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

$maskID = 		$_SESSION['mask'];
$characterID = 	$_SESSION['characterID'];
$systemID = 	isset($_REQUEST['systemID']) ? $_REQUEST['systemID'] : null;
$commentID = 	isset($_REQUEST['commentID']) ? $_REQUEST['commentID'] : null;
$comment = 		isset($_REQUEST['comment']) ? $_REQUEST['comment'] : null;
$mode = 		isset($_REQUEST['mode']) ? $_REQUEST['mode'] : null;
$output = 		null;

if ($mode == 'save') {
	$query = 'INSERT INTO comments (id, systemID, comment, created, createdBy, modifiedBy, maskID)
				VALUES (:commentID, :systemID, :comment, NOW(), :createdBy, :modifiedBy, :maskID)
				ON DUPLICATE KEY UPDATE
				systemID = :systemID, comment = :comment, modifiedBy = :modifiedBy, modified = NOW()';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID, PDO::PARAM_INT);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':comment', $comment, PDO::PARAM_STR);
	$stmt->bindValue(':createdBy', $characterID, PDO::PARAM_INT);
	$stmt->bindValue(':modifiedBy', $characterID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$output['result'] = $stmt->execute();

	if ($output['result']) {
		$query = 'SELECT id, DATE_FORMAT(created, \'%m/%d/%Y %h:%i:%s\') AS createdDate, c.characterName AS createdBy, DATE_FORMAT(modified, \'%m/%d/%Y %h:%i:%s\') AS modifiedDate, m.characterName AS modifiedBy FROM comments LEFT JOIN characters c ON createdBy = c.characterID LEFT JOIN characters m ON modifiedBy = m.characterID WHERE id = :commentID AND maskID = :maskID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':commentID', ($commentID ? $commentID : $mysql->lastInsertId()), PDO::PARAM_INT);
		$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
		$stmt->execute();
		$output['comment'] = $stmt->fetchObject();
	}
} else if ($mode == 'delete' && $commentID) {
	$query = 'DELETE FROM comments WHERE id = :commentID AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$output['result'] = $stmt->execute();
} else if ($mode == 'sticky' && $commentID) {
	$query = 'UPDATE comments SET systemID = :systemID WHERE id = :commentID AND maskID = :maskID';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':commentID', $commentID, PDO::PARAM_INT);
	$stmt->bindValue(':systemID', $systemID, PDO::PARAM_INT);
	$stmt->bindValue(':maskID', $maskID, PDO::PARAM_STR);
	$output['result'] = $stmt->execute();
}


$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

echo json_encode($output);
?>