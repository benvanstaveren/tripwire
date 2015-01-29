<?php
/*
header('Content-Type: application/json');

$headers[] = "Accept-Encoding: gzip";
$start = date('YmdHi', strtotime('-1 hour'));
$end = date('YmdHi', time());
$url = "https://zkillboard.com/api/no-items/no-attackers/startTime/$start/endTime/$end/w-space/";

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
curl_setopt($curl, CURLOPT_BINARYTRANSFER, true);
curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');
$result = json_decode(curl_exec($curl));

$activity = array();
foreach ($result AS $kill) {
	//$kill = json_decode($kill);

	if ($kill->victim->shipTypeID == '670' || $kill->victim->shipTypeID == '33328') {
		$activity[(int)$kill->solarSystemID]['podKills'] += 1;
	} else {
		$activity[(int)$kill->solarSystemID]['shipKills'] += 1;
	}
}
#echo $result;
echo json_encode($activity);
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

	echo var_dump($headers);
}


?>