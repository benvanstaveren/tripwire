<?php
//***********************************************************
//	File: 		login.php
//	Author: 	Daimian
//	Created: 	2/13/2014
//	Modified: 	2/13/2014 - Daimian
//
//	Purpose:	Handles the login process.
//
//	ToDo:
//***********************************************************
if (!session_id()) session_start();

$startTime = microtime(true);

require('db.inc.php');

function login_history($ip, $username, $method, $result) {
	global $mysql;

	$query = 'INSERT INTO _history_login (ip, username, method, result) VALUES (:ip, :username, :method, :result)';
	$stmt = $mysql->prepare($query);
	$stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
	$stmt->bindValue(':username', $username, PDO::PARAM_STR);
	$stmt->bindValue(':method', $method, PDO::PARAM_STR);
	$stmt->bindValue(':result', $result, PDO::PARAM_STR);
	$stmt->execute();
}

$mode = 		isset($_REQUEST['mode'])?$_REQUEST['mode']:null;
$selected = 	isset($_REQUEST['selected'])?$_REQUEST['selected']:null;
$code = 		isset($_REQUEST['code'])?$_REQUEST['code']:null;

if ($mode == 'login' || !$mode) {
	$username 	= isset($_REQUEST['username'])?$_REQUEST['username']:(isset($_COOKIE['username'])?$_COOKIE['username']:null);
	$password 	= isset($_REQUEST['password'])?$_REQUEST['password']:(isset($_COOKIE['password'])?$_COOKIE['password']:null);
	$method		= isset($_REQUEST['username'])?'user':'cookie';
	$remember	= isset($_REQUEST['remember'])?1:0;
	$ip 		= $_SERVER['REMOTE_ADDR'];

	// Check input
	if (!$username || !$password || !$ip) {
		if (!$username) {
			$output['field'] = 'username';
			$output['error'] = 'Username required.';
		} else if (!$password) {
			$output['field'] = 'password';
			$output['error'] = 'Password required.';
		} else if (!$ip) {
			$output['field'] = 'password';
			$output['error'] = 'IP not detected.';
		}
	} else if (strlen($password) > 72) {
		$output['field'] = 'password';
		$output['error'] = 'Password too long.';
	} else {
		// Check login attempts
		$query = 'SELECT COUNT(ip) FROM _history_login WHERE ip = :ip AND DATE_ADD(time, INTERVAL 30 SECOND) > NOW()';
		$stmt = $mysql->prepare($query);
		$stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
		$stmt->execute();
		if ($stmt->fetchColumn(0) > 3) {
			$output['field'] = 'username';
			$output['error'] = 'Login attempts exceeded, please wait 30 seconds.';

			// Log the attempt
			login_history($ip, $username, $method, 'fail');
		} else {
			$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE username = :username';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':username', $username, PDO::PARAM_STR);
			$stmt->execute();
			if ($account = $stmt->fetchObject()) {
				require('password_hash.php');
				$hasher = new PasswordHash(8, FALSE);

				if ($account->ban == 1) {
					$output['field'] = 'username';
					$output['error'] = 'You have been banned.';

					// Log the attempt
					login_history($ip, $username, $method, 'fail');
				} else if ($hasher->CheckPassword($password, $account->password) == false) {
					$output['field'] = 'password';
					$output['error'] = 'Password incorrect.';

					// Log the attempt
					login_history($ip, $username, $method, 'fail');
				} else {
					require('options.class.php');
					$options = options::getOptions($mysql, $account->id);

					$_SESSION['userID'] = $account->id;
					$_SESSION['username'] = $account->username;
					$_SESSION['ip'] = $ip;
					$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
					$_SESSION['characterID'] = $account->characterID;
					$_SESSION['characterName'] = $account->characterName;
					$_SESSION['corporationID'] = $account->corporationID;
                    $_SESSION['corporationName'] = $account->corporationName;
                    $_SESSION['admin'] = $account->admin;
                    $_SESSION['super'] = $account->super;
					$_SESSION['options'] = $options;

					$output['result'] = 'success';
					$output['session'] = $_SESSION;

					// Log the attempt
					login_history($ip, $username, $method, 'success');

					$query = 'INSERT INTO userStats (userID, loginCount) VALUES (:userID, 1) ON DUPLICATE KEY UPDATE lastLogin = NOW(), loginCount = loginCount + 1';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':userID', $account->id, PDO::PARAM_INT);
					$stmt->execute();

					//save cookie on client PC for 30 days
					if ($remember) {
						setcookie('username', $username, time()+60*60*24*30, '/');
						setcookie('password', $password, time()+60*60*24*30, '/');
					}
				}
			} else {
				$output['field'] = 'username';
				$output['error'] = "Username doesn't exist.";

				// Log the attempt
				login_history($ip, $username, $method, 'fail');
			}
		}
	}
} else if ($mode == 'api') {
	$keyID 		= isset($_REQUEST['api_key'])?$_REQUEST['api_key']:null;
	$vCode 		= isset($_REQUEST['api_code'])?$_REQUEST['api_code']:null;
	$method		= 'api';
	$mask 		= 33554432;
	$ip 		= $_SERVER['REMOTE_ADDR'];

	// Check input
	if (!$keyID || !$vCode) {
		$output['field'] = 'api';
		$output['error'] = 'API Key & vCode required.';
	} else {
		require('api.class.php');
		$API = new API();

		if ($API->checkAccount($keyID, $vCode) == 0) {
			$output['field'] = 'api';
			$output['error'] = "API requires 'Account Status' permission.";
		} else if ($API->checkMask($keyID, $vCode, $mask) == 0) {
			$output['field'] = 'api';
			$output['error'] = "API requires ONLY 'Account Status' permission.";
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

				$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':characterID', $characters[$selected]->characterID, PDO::PARAM_INT);
				$stmt->execute();

				if ($account = $stmt->fetchObject()) {
					require('options.class.php');
					$options = options::getOptions($mysql, $account->id);

					$_SESSION['userID'] = $account->id;
					$_SESSION['username'] = $account->username;
					$_SESSION['ip'] = $ip;
					$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
					$_SESSION['characterID'] = $account->characterID;
					$_SESSION['characterName'] = $account->characterName;
					$_SESSION['corporationID'] = $account->corporationID;
					$_SESSION['corporationName'] = $account->corporationName;
                    $_SESSION['admin'] = $account->admin;
					$_SESSION['super'] = $account->super;
					$_SESSION['options'] = $options;

					$output['result'] = 'success';
					$output['session'] = $_SESSION;

					// Log the attempt
					login_history($ip, NULL, $method, 'success');

					$query = 'INSERT INTO userStats (userID, loginCount) VALUES (:userID, 1) ON DUPLICATE KEY UPDATE lastLogin = NOW(), loginCount = loginCount + 1';
					$stmt = $mysql->prepare($query);
					$stmt->bindValue(':userID', $account->id, PDO::PARAM_INT);
					$stmt->execute();
				} else {
					$output['field'] = count($characters) > 1 ? 'select' : 'api';
					$output['error'] = 'No registered accounts with that character found.';

					// Log the attempt
					login_history($ip, NULL, $method, 'fail');
				}
			}
		}
	}
} else if ($mode == 'sso') {
	$method		= 'sso';
	$ip 		= $_SERVER['REMOTE_ADDR'];

	require('crest.class.php');
	$CREST = new CREST();

	if ($code) {
		$characterID = $CREST->authenticate($code);
		if ($characterID) {
			$query = 'SELECT id, username, password, accounts.ban, characterID, characterName, corporationID, corporationName, admin, super, options FROM accounts LEFT JOIN preferences ON id = preferences.userID LEFT JOIN characters ON id = characters.userID WHERE characterID = :characterID';
			$stmt = $mysql->prepare($query);
			$stmt->bindValue(':characterID', $characterID, PDO::PARAM_INT);
			$stmt->execute();

			if ($account = $stmt->fetchObject()) {
				require('options.class.php');
				$options = options::getOptions($mysql, $account->id);

				$_SESSION['userID'] = $account->id;
				$_SESSION['username'] = $account->username;
				$_SESSION['ip'] = $ip;
				$_SESSION['mask'] = @$options->masks->active ? $options->masks->active : $account->corporationID . '.2';
				$_SESSION['characterID'] = $account->characterID;
				$_SESSION['characterName'] = $account->characterName;
				$_SESSION['corporationID'] = $account->corporationID;
				$_SESSION['corporationName'] = $account->corporationName;
				$_SESSION['admin'] = $account->admin;
				$_SESSION['super'] = $account->super;
				$_SESSION['options'] = $options;

				// Log the attempt
				login_history($ip, NULL, $method, 'success');

				$query = 'INSERT INTO userStats (userID, loginCount) VALUES (:userID, 1) ON DUPLICATE KEY UPDATE lastLogin = NOW(), loginCount = loginCount + 1';
				$stmt = $mysql->prepare($query);
				$stmt->bindValue(':userID', $account->id, PDO::PARAM_INT);
				$stmt->execute();

				header('Location: .?system=');
				exit();
			}

			header('Location: ./?error=account#login#sso');
			exit();
		}

		header('Location: ./?error=unknown#login#sso');
		exit();
	} else {
		$CREST->login();
	}
}

if (isset($output['field']) && isset($API) && $output['field'] == 'api') {
	$output['error'] .= ' Cached Until: ' . $API->cachedUntil .' EVE';
}

$output['proccessTime'] = sprintf('%.4f', microtime(true) - $startTime);

if (isset($_REQUEST['mode'])) echo json_encode($output);
?>
