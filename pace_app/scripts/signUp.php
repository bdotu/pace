<?php
	require('connection.php');
	$inputFormData = file_get_contents('php://input');
	$data = json_decode($inputFormData);
	$firstname = $mysql->real_escape_string($data->fname);
	$lastname = $mysql->real_escape_string($data->lname);
	$email = $mysql->real_escape_string($data->email);
	$password = md5($mysql->real_escape_string($data->password));
	$interests = $mysql->real_escape_string($data->interests);
	
	$sql = "INSERT INTO users (firstname, lastname, email, password) VALUES ('{$firstname}', '{$lastname}', '{$email}', '{$password}')";

	if ($mysql->query($sql)) {
		$user_id = $mysql->insert_id;
	    $userInformation = array('id' => $user_id); 
	    insert_interests($user_id);
	    print_r(json_encode($userInformation));
	} else {
	    echo "Error: " . $sql . "<br/>" . $mysql->error;
	}

	function insert_interests($user_id){
		global $interests, $mysql;
		$interestsArray = explode(",", $interests);
		foreach ($interestsArray as $interest) {
			$eachInterest = mb_strtolower(trim($interest));
			$sql = "INSERT IGNORE INTO interests (interest) VALUES('{$eachInterest}')";
			if ($mysql->query($sql)) {
				// Insert into userInterests
				$possible_interest_id = $mysql->insert_id;
				error_log("array: " . json_encode($interestsArray) . ", interest: " . $eachInterest . ", id: " . $possible_interest_id);
				insert_user_interest($user_id, $possible_interest_id, $eachInterest);
			}
			else {
				error_log($eachInterest . " insertion failed " . $mysql->error);
			}
		}
	}

	function insert_user_interest($user_id, $possible_interest_id, $eachInterest){
		global $mysql;
		$interest_id = 0;
		if ($possible_interest_id != 0){
			$interest_id = $possible_interest_id;
		}
		else {
			$sql = "SELECT id from interests WHERE interest = '{$eachInterest}' ";
			if ($result = $mysql->query($sql)){
				$interest_info = $result->fetch_assoc();
				$interest_id = $interest_info['id'];	
			}
			else {
				echo "MySQL query failed: " . $mysql->error;
			}
		}
		$user_interest_sql = "INSERT INTO userInterests (user_id, interest_id) VALUES ('{$user_id}', '{$interest_id}')";
		if (!$mysql->query($user_interest_sql)) {
			echo "UserInterest - MySQL query failed " . $mysql->error;
		}
	}

	$mysql->close();
?>