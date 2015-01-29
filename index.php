<?php

session_start();

if (!isset($_SESSION['username']) && isset($_COOKIE['username']))
	include('login.php');

if (isset($_GET['system']) && isset($_SESSION['userID'])) {
	require('tripwire.php');
} else {
	require('landing.php');
}

?>