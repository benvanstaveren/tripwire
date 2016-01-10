<?php

// EVE SDE table name
$eve_dump = 'eve_carnyx';

// CREST info
$crestClient = 'clientID';
$crestSecret = 'secret';
$crestUrl = 'http://localhost/login.php?mode=sso';

try {
    $mysql = new PDO(
        'mysql:host=localhost;dbname=tripwire_database;charset=utf8',
        'username',
        'password',
        Array(
            PDO::ATTR_PERSISTENT     => true
        )
    );
} catch (PDOException $error) {
    echo 'DB error';//$error;
}

?>
