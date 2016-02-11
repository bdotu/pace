<?php
	require('connection.php');
	
	$sql = "SELECT distinct concat_ws(', ', c.city, s.state_code) as display_city FROM cities_extended c, states s WHERE c.state_code = s.state_code and c.zip = $zip";
	$result = $mysql->query($sql);
	if ($result->num_rows > 0) {
		$row = $result->fetch_assoc();
	    echo json_encode($row);
	} else {
	    echo "0 results";
	}
	$mysql->close();
?>