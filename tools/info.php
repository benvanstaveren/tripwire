<?php

$startTime = microtime(true);

session_start();

if(!isset($_SESSION['userID']) || $_SESSION['userID'] != 1) {
	echo 'Security Failure!';
	exit();
}

phpInfo();

echo sprintf('%.4f', microtime(true) - $startTime);

?>