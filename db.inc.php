<?php

$eve_dump = 'eve_carnyx';

try {
    $mysql = new PDO(
        'mysql:host=10.132.118.131;dbname=tripwire;charset=utf8',
        'tripwire',
        'mWPBHh54BjP28Dws',
        Array(
            PDO::ATTR_PERSISTENT     => true
        )
    );
} catch (PDOException $error) {
    echo 'DB error';//$error;
}

?>
