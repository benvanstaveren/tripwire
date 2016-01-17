<?php

if (!session_id()) session_start();

require('db.inc.php');
require('password_hash.php');
require('api.class.php');

$username = 	isset($_REQUEST['username'])?$_REQUEST['username']:null;
$password = 	isset($_REQUEST['password'])?$_REQUEST['password']:null;
$confirm = 		isset($_REQUEST['confirm'])?$_REQUEST['confirm']:null;
$keyID = 		isset($_REQUEST['api_key'])?$_REQUEST['api_key']:null;
$vCode = 		isset($_REQUEST['api_code'])?$_REQUEST['api_code']:null;
$selected = 	isset($_REQUEST['selected'])?$_REQUEST['selected']:null;
$mode = 		isset($_REQUEST['mode'])?$_REQUEST['mode']:null;
$mask = 		33554432;
$verified = 	false;
$output = 		null;

header('Content-Type: application/json');

if ($mode == 'user') {
	// Check username requirements
	if (!$username) {
		$output['field'] = 'username';
		$output['error'] = 'Must have a username.';
	} else if (strlen($username) < 5) {
		$output['field'] = 'username';
		$output['error'] = 'Must be 5 characters or more.';
	} else {
		$query = 'SELECT username FROM accounts WHERE username = :username';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':username', $username, PDO::PARAM_STR);
		$stmt->execute();
		if ($stmt->rowCount()) {
			$output['field'] = 'username';
			$output['error'] = 'Already taken.';
		}
	}

	// Check password requirements
	if (!$output) {
		if (!$password) {
			$output['field'] = 'password';
			$output['error'] = 'Must have a password.';
		} else if (strlen($password) > 72) {
			$output['field'] = 'password';
			$output['error'] = 'Password is too long.';
		} else if (strlen($password) < 5) {
			$output['field'] = 'password';
			$output['error'] = 'Must be 5 characters or more.';
		} else if ($password !== $confirm) {
			$output['field'] = 'password';
			$output['error'] = 'Passwords do not match.';
		}
	}

	// Check API requirements
	if (!$output) {
		if (!$keyID) {
			$output['field'] = 'api';
			$output['error'] = 'API key required.';
		} else if (!$vCode) {
			$output['field'] = 'api';
			$output['error'] = 'API vCode required.';
		}
	}

	// Get characters
	if (!$output) {
		$API = new API();

		if ($API->checkAccount($keyID, $vCode) == 0) {
			$output['field'] = 'api';
			$output['error'] = "API requires 'Account Status' permission.";
		} else if ($API->checkMask($keyID, $vCode, $mask) == 0) {
			$output['field'] = 'api';
			$output['error'] = "API 'Account Status' permission ONLY - too many permissions.";
		} else {
			$characters = $API->getCharacters($keyID, $vCode);

			if (count($characters) == 0) {
				$output['field'] = 'api';
				$output['error'] = 'API has no characters.';
			} else if ($characters === 0) {
				$output['field'] = 'api';
				$output['error'] = "API expired or doesn't exist.";
			} else if (!$selected && count($characters) > 1) {
				$output['characters'] = $characters;
			} else if (count($characters) == 1 || array_key_exists($selected, $characters)) {
				$selected = $selected ? $selected : key($characters);

				$query = 'SELECT characterID, ban FROM characters WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $characters[$selected]->characterID, PDO::PARAM_INT);
				$stmt->execute();

				if ($stmt->fetchColumn(1)) {
					$output['field'] = count($characters) > 1 ? 'select' : 'api';
					$output['error'] = 'Character '.$characters[$selected]->characterName.' is banned.';
				} else if ($stmt->rowCount()) {
					$output['field'] = count($characters) > 1 ? 'select' : 'api';
					$output['error'] = 'Character '.$characters[$selected]->characterName.' already assigned to an account.';
				} else {
					$hasher = new PasswordHash(8, FALSE);
					$password = $hasher->HashPassword($password);

					$query = 'INSERT INTO accounts (username, password) VALUES (:username, :password)';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':username', $username, PDO::PARAM_STR);
					$stmt->bindValue(':password', $password, PDO::PARAM_STR);
					$success = $stmt->execute();

					$userID = $mysql->lastInsertId();

					$query = 'INSERT INTO characters (userID, characterID, characterName, corporationID, corporationName) VALUES (:userID, :characterID, :characterName, :corporationID, :corporationName)';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':userID', $userID, PDO::PARAM_INT);
					$stmt->bindValue(':characterID', $characters[$selected]->characterID, PDO::PARAM_INT);
					$stmt->bindValue(':characterName', $characters[$selected]->characterName, PDO::PARAM_STR);
					$stmt->bindValue(':corporationID', $characters[$selected]->corporationID, PDO::PARAM_INT);
					$stmt->bindValue(':corporationName', $characters[$selected]->corporationName, PDO::PARAM_STR);
					$output['created'] = $stmt->execute();
				}
			}
		}
	}
} else if ($mode == 'corp') {
	// Check API requirements
	if (!$output) {
		if (!$keyID) {
			$output['field'] = 'api';
			$output['error'] = 'API key required.';
		} else if (!$vCode) {
			$output['field'] = 'api';
			$output['error'] = 'API vCode required.';
		}
	}

	if (!$output) {
		$API = new API();

		$characters = $API->getCharacters($keyID, $vCode);

		if (count($characters) == 0) {
			$output['field'] = 'api';
			$output['error'] = 'API has no characters.';
		} else if ($characters === 0) {
			$output['field'] = 'api';
			$output['error'] = "API expired or doesn't exist.";
		} else if (!$API->checkMask($keyID, $vCode, 8)) {
			$output['field'] = 'api';
			$output['error'] = "API 'Character Sheet' permission required.";
		} else if (!$selected && count($characters) > 1) {
			$output['characters'] = $characters;
		} else if (count($characters) == 1 || array_key_exists($selected, $characters)) {
			$selected = $selected ? $selected : key($characters);

			if ($result = $API->checkDirectorRole($keyID, $vCode, $characters[$selected]->characterID)) {
				$query = 'SELECT admin FROM characters WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $characters[$selected]->characterID, PDO::PARAM_INT);
				$stmt->execute();

				if ($result = $stmt->fetchColumn(0)) {
					$output['field'] = count($characters) > 1 ? 'select' : 'api';
					$output['error'] = $characters[$selected]->characterName.' already has corporate admin.';
				} else if ($result === false) {
					$output['field'] = count($characters) > 1 ? 'select' : 'api';
					$output['error'] = $characters[$selected]->characterName.' is not registered to a Tripwire user yet.';
				} else {
					$query = 'UPDATE characters SET admin = 1 WHERE characterID = :characterID';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':characterID', $characters[$selected]->characterID, PDO::PARAM_INT);
					$output['result'] = $stmt->execute();
					$output['character'] = $characters[$selected]->characterName;

					if (session_id()) $_SESSION['admin'] = 1;
				}
			} else {
				$output['field'] = count($characters) > 1 ? 'select' : 'api';
				$output['error'] = 'Character must have Director roll or be CEO.';
			}
		}
	}
}

if (isset($output['field']) && isset($API) && $output['field'] == 'api') {
	$output['error'] .= ' Cached Until: ' . $API->cachedUntil .' EVE';
}

echo json_encode($output);

?>
