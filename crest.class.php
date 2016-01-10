<?php

class CREST {
    // https://api-sisi.testeveonline.com/
    // https://sisilogin.testeveonline.com
    private static $baseUrl = '';
    private static $loginUrl = 'https://login.eveonline.com/oauth';

    public function login($scope = NULL) {
        global $crestClient;
        global $crestUrl;

        $params = array(
            'response_type' => 'code',
            'redirect_uri' => $crestUrl,
            'client_id' => $crestClient,
            'scope' => $scope,
            'state' => 'evessologin'
        );

        header('Location: '. self::$loginUrl . '/authorize?' . http_build_query($params), true, 302);
    }

    public function authenticate($code) {
        global $crestSecret;
        global $crestClient;
        $header = 'Authorization: Basic '.base64_encode($crestClient.':'.$crestSecret);
        $params = array(
            'grant_type' => 'authorization_code',
            'code' => $code
        );

        $curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, self::$loginUrl . '/token');
		curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
		curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

		$result = curl_exec($curl);

        if ($result === false) {
            return false;//curl_error($curl);
        }

        $response = json_decode($result);
        $auth_token = $response->access_token;

        $header = 'Authorization: Bearer '.$auth_token;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, self::$loginUrl . '/verify');
        curl_setopt($curl, CURLOPT_HTTPHEADER, array($header));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Tripwire 0.6.x daimian.mercer@gmail.com');

        $result = curl_exec($curl);

        if ($result === false) {
            return false;//curl_error($curl);
        }

        $response = json_decode($result);
        if (!isset($response->CharacterID)) {
            return false;//'No character ID returned';
        }

        return $response->CharacterID;
    }

}

?>
