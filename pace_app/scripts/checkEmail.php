<?php
	require('connection.php');
	$email = file_get_contents('php://input');
	
	$sql = "SELECT * FROM users WHERE email = '{$email}' ";

	if ($result = $mysql->query($sql)){
		if ($result->num_rows == 0){
			echo "unique";
		}
		else {
			echo "not unique";
		}
	}
	else {
		echo "MySQL query failed: " . $mysql->error;
	}


	$mysql->close();
?>