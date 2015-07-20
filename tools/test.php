 
<?php
 
     $start = microtime(true);
 
        for ($i = 0; $i < 50000; $i++) {
                include('test_include.php');
        }
 
	$end = microtime(true);
 
        echo "Start: " . $start . "<br />";
        echo "End: " . $end . "<br />";
        echo "Diff: ". ($end-$start) . "<br />";
 
?>