<?php
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$zip = $request->zip;

	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "us_address";
	// Create connection
	$conn = new mysqli($servername, $username, $password, $dbname);

	// Check connection
	if ($conn->connect_error) {
	    die("Connection failed: " . $conn->connect_error);
	} 
	else {
		$sql = "SELECT distinct concat_ws(', ', c.city, s.state_code) as display_city FROM cities_extended c, states s WHERE c.state_code = s.state_code and c.zip = $zip";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) {
			$row = $result->fetch_assoc();
		    echo json_encode($row);
		} else {
		    echo "0 results";
		}
		$conn->close();
	}
?>