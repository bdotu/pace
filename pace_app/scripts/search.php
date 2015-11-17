<?php

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$url = $request->path;

$crl = curl_init();
curl_setopt($crl, CURLOPT_URL, $url);
$info = curl_exec($crl);

print_r($info);
//echo($info);
?>