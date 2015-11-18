<?php
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
		$sql = "SELECT distinct concat_ws(', ', c.city, s.state_code) as display_city, c.city, s.state_code, s.state FROM cities_extended c, states s WHERE c.state_code = s.state_code order by s.state, c.city";
		$result = $conn->query($sql);
		if ($result->num_rows > 0) {

			$cities_info = array();
	    	// output data of each row
	    	while($row = $result->fetch_assoc()) {
	    		array_push($cities_info, $row);
		    }
		    echo json_encode($cities_info);
		} else {
		    echo "0 results";
		}
		$conn->close();
	}
?>