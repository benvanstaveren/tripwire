<?php
//if (!session_id()) session_start();

//require('../db.inc.php');

class options {

	public function getOptions($mysql, $userID) {
		//cookie
		#if (isset($_COOKIE) && isset($_COOKIE['twOptions']) && @json_decode($_COOKIE['twOptions'])->userID == $userID)
		#	return json_decode($_COOKIE['twOptions']);
		
		//db
		$query = 'SELECT options FROM preferences WHERE userID = :userID';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
		$stmt->execute();
		return json_decode($stmt->fetchColumn(0));
	}

	public function setOptions($options) {
		//db
		//session
		echo $options;
	}

}

//$options = options::getOptions($mysql);
//$options = new options($mysql);

//echo @$options->masks->active ? $options->masks->active : $_SESSION['corporationID'] . '.2';

?>