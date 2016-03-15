<?php
	require('connection.php');
	$inputFormData =  file_get_contents('php://input');
	$data = json_decode($inputFormData);
	$message_type = $mysql->real_escape_string($data->messageType);
	$id = intval($data->id);
	$sql = "";
	$update_sql = "";

	//Update Message to Reflect Read vs. Unread messages.
	if ($message_type == "inbox") {
		$update_sql = "UPDATE messages SET message_read = 1 WHERE user_id = {$id} ";
		$update_result = $mysql->query($update_sql);
		if ($update_result) {
			error_log('affected_rows:' . $mysql->affected_rows);
			$sql = "SELECT m.id, m.sender_id as user_response_id, s.firstname, s.lastname, m.subject, m.body, m.delivery_time from messages m, users s where s.id = m.sender_id and m.receiver_delete = 0 and m.user_id = {$id} order by m.delivery_time desc";
		}
		else {
			error_log("MySQL query failed: " . $mysql->error);
		}
	}
	else {
		$sql = "SELECT m.id, m.user_id as user_response_id, s.firstname, s.lastname, m.subject, m.body, m.delivery_time from messages m, users s where s.id = m.user_id and m.sender_delete = 0 and m.sender_id = {$id} order by m.delivery_time desc";
	}
	if ($result = $mysql->query($sql)){
		$messages = array();

		while ($eachMessage = $result->fetch_assoc()) {
			$message_post_date = new DateTime($eachMessage['delivery_time']);
			$today = new DateTime();
			$interval = $message_post_date->diff($today);
			if ($interval->d == 0) {
				$eachMessage['delivery_time'] = $message_post_date->format('g:i A');
			}
			else {
				$eachMessage['delivery_time'] = $message_post_date->format('jS M, Y');
			}
			array_push($messages, $eachMessage);
		}
		echo json_encode($messages);
	}
	else {
		echo "Can't retrieve messages in inbox: " . $mysql->error;
	}
?>