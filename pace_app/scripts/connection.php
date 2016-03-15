<?php
	require('constants.php');
	// Create connection
	$mysql = new mysqli(DBSERVER, DBUSER, DBPASSWORD, DBNAME);
	if ($mysql->connect_errno) {
	    echo "Failed to connect to MySQL: (" . $mysql->connect_errno . ") " . $mysql->connect_error;
	}
?>