<?php
	require('connection.php');
	$inputFormData =  file_get_contents('php://input');
	$data = json_decode($inputFormData);
	$message_type = $mysql->real_escape_string($data->messageType);
	$id = intval($data->message_id);
	$sql = "";

	if ($message_type == "inbox") {
		$sql = "UPDATE messages SET receiver_delete = 1 WHERE id = {$id} ";
	}
	else {
		$sql = "UPDATE messages SET sender_delete = 1 WHERE id = {$id} ";
	}
	$result = $mysql->query($sql);
	if (!$result) {
		echo "MySQL query failed: " . $mysql->error; 
	}
	else {
		error_log('affected_rows:' . $mysql->affected_rows);
	}	
?>