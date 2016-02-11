<?php
	require('connection.php');
	$inputFormData =  file_get_contents('php://input');
	$data = json_decode($inputFormData);
	$email = mysql_escape_string($data->email);
	$password = md5(mysql_escape_string($data->password));

	$sql = "SELECT id, firstname FROM users WHERE email = '{$email}' and password = '{$password}' ";

	if ($result = $mysql->query($sql)){
		if ($result->num_rows == 1){
			$userDetail = $result->fetch_assoc();
			error_log(json_encode($userDetail));
			print_r(json_encode($userDetail));
		}
		else {
			echo "error";
		}
	}
	else {
		echo "MySQL query failed: " . $mysql->error;
	}


	$mysql->close();
?>