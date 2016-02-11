<?php
	require('connection.php');
	$user_id = intval(file_get_contents('php://input'));
	
	$sql = "SELECT id FROM messages WHERE user_id = {$user_id} AND message_read = 0 ";

	if ($result = $mysql->query($sql)){
		if ($result->num_rows > 0){
			echo "new_message_available";
		}
		else {
			echo "no new message";
		}
	}
	else {
		echo "MySQL query failed: " . $mysql->error;
	}


	$mysql->close();
?>