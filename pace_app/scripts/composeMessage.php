<?php
	require('connection.php');
	$inputFormData = file_get_contents('php://input');
	$data = json_decode($inputFormData);

	$user_id = intval($data->user_id);
	$sender_id = intval($data->sender_id);
	$subject = $mysql->real_escape_string($data->subject);
	$body = $mysql->real_escape_string($data->body);

	$sql = "INSERT INTO messages (user_id, sender_id, subject, body) VALUES ({$user_id}, {$sender_id}, '{$subject}', '{$body}') ";

	if ($mysql->query($sql)) {
		error_log("success");
	} else {
	    echo "Error: " . $sql . "<br/>" . $mysql->error;
	}
?>