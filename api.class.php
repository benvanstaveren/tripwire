<?php

class API {
	private static $baseUrl = 'https://api.eveonline.com';
	public $cachedUntil = null;

	private function getAPI($url, $params) {
		$url = self::$baseUrl . $url;

		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

		$result = curl_exec($curl);

		$this->getCachedUntil($result);
		return $result;
	}

	private function getCachedUntil($curl) {
		$xpath = "//cachedUntil";

		if ($xmlFile = @simplexml_load_string($curl)) {
			$xmls = $xmlFile->xpath($xpath);
			$cachedUntil = $xmls[0]->__toString();

			$cachedUntil = date('h:i:s', strtotime($cachedUntil));

			$this->cachedUntil = $cachedUntil;
		} else {
			$this->cachedUntil = null;
		}
	}

	public function getEveIds($ids) {
		$url = '/eve/CharacterAffiliation.xml.aspx';
		$params = array('ids' => $ids);

		$xpath = "//rowset[@name='characters']/row";

		$results = array();

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$xmls = $xmlFile->xpath($xpath);

			foreach ($xmls as $xml) {
				$result = new eveData();

				if ($xml['corporationName']->__toString() == '') {
					$result->type = 2;
					$result->corporationID = $xml['characterID']->__toString();
					$result->corporationName = $xml['characterName']->__toString();
					$result->allianceID = $xml['allianceID']->__toString();
					$result->allianceName = $xml['allianceName']->__toString();
					$result->factionID = $xml['factionID']->__toString();
					$result->factionName = $xml['factionName']->__toString();
				} else {
					$result->type = 1373;
					$result->characterID = $xml['characterID']->__toString();
					$result->characterName = $xml['characterName']->__toString();
					$result->corporationID = $xml['corporationID']->__toString();
					$result->corporationName = $xml['corporationName']->__toString();
					$result->allianceID = $xml['allianceID']->__toString();
					$result->allianceName = $xml['allianceName']->__toString();
					$result->factionID = $xml['factionID']->__toString();
					$result->factionName = $xml['factionName']->__toString();
				}

				$results[] = $result;
			}

			return count($results) > 0 ? $results : 0;
		}

		return 0;
	}

	public function searchName($names) {
		$url = '/eve/CharacterID.xml.aspx';
		$params = array('names' => $names);

		$xpath = "//rowset[@name='characters']/row";

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$xmls = $xmlFile->xpath($xpath);

			$ids = array();
			foreach ($xmls as $xml) {
				$ids[] = $xml['characterID']->__toString();
			}

			return $this->getEveIds(implode(',', $ids));
		}

		return 0;
	}

	public function getCharacters($keyID, $vCode) {
		$url = '/account/Characters.xml.aspx';
		$params = array('keyId' => $keyID, 'vCode' => $vCode);

		$xpath = "//rowset[@name='characters']/row";

		$results = array();

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$xmls = $xmlFile->xpath($xpath);

			foreach ($xmls as $xml) {
				$result = new eveData();

				$result->characterID = $xml['characterID']->__toString();
				$result->characterName = $xml['name']->__toString();
				$result->corporationID = $xml['corporationID']->__toString();
				$result->corporationName = $xml['corporationName']->__toString();
				$result->allianceID = $xml['allianceID']->__toString();
				$result->allianceName = $xml['allianceName']->__toString();
				$result->factionID = $xml['factionID']->__toString();
				$result->factionName = $xml['factionName']->__toString();

				$results[$result->characterID] = $result;
			}

			return count($results) > 0 ? $results : 0;
		}

		return 0;
	}

	public function checkDirectorRole($keyID, $vCode, $characterID) {
		$url = '/char/CharacterSheet.xml.aspx';
		$params = array('keyId' => $keyID, 'vCode' => $vCode, 'characterID' => $characterID);

		$xpath = "//rowset[@name='corporationRoles']/row[@roleName='roleDirector']";

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$result = $xmlFile->xpath($xpath);

			return count($result) > 0;
		}

		return 0;
	}

	public function checkAccount($keyID, $vCode) {
		$url = '/account/AccountStatus.xml.aspx';
		$params = array('keyId' => $keyID, 'vCode' => $vCode);

		$xpath = "//paidUntil";

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$result = $xmlFile->xpath($xpath);

			return count($result) > 0 ? 1 : 0;
		}

		return 0;
	}

	public function checkMask($keyID, $vCode, $mask) {
		$url = '/account/APIKeyInfo.xml.aspx';
		$params = array('keyId' => $keyID, 'vCode' => $vCode);

		$xpath = "//key[@accessMask='$mask']";

		if ($xmlFile = @simplexml_load_string($this->getAPI($url, $params))) {
			$result = $xmlFile->xpath($xpath);

			return count($result) > 0 ? 1 : 0;
		}

		return 0;
	}
}

class eveData {
	public $type = null;
	public $characterID = null;
	public $characterName = null;
	public $corporationID = null;
	public $corporationName = null;
	public $allianceID = null;
	public $allianceName = null;
	public $factionID = null;
	public $factionName = null;
}

?>
