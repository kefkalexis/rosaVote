<?php

	$text = "StuPa-Wahlen vom 6.-10.Juli";

	//Daten Laden
	if (!isset($_GET["id"]))
		{header('location: ../rosaVote.html'); }

	$file = file_get_contents("../data/parties.JSON");
	$parties = json_decode($file, true);

	$data = $_GET["id"];

	$seed = hexdec ( substr($data, 0, 2) );

	$checksum = hexdec ( substr($data, strlen($data) - 2, strlen($data)) );
	
	$maxpercent = 0;
	$i = 1;
	$sum = $seed;
	foreach ($parties as $party) {
		$perc =  hexdec(substr($data, $i * 2, 2)) - $seed;
		$parties[$party["shortname"]]["percentage"] = $perc;
		$i++;
		$sum += $perc;
		$maxpercent = max($maxpercent, $perc);
	}

	$sum = $sum % 256;

 	if($sum != $checksum)
		{header('location: ../rosaVote.html'); }

	uasort($parties, "cmp");


	function cmp($a, $b)
	{
	   return ($a["percentage"] < $b["percentage"]);
	}

	//png erstellen

	header("Content-type: image/png");
	$bild = imagecreatetruecolor(200, 200);
	//imagecolorallocate($bild, 255,255,255);
	
	$farbeweiss = imagecolorallocate($bild, 255, 255, 255);

	imagefilledrectangle($bild, 0,0,200,200,  $farbeweiss);

	//font laden
	$font = getcwd() . "/vera.ttf";
	// Farben festlegen
	$farbegrau = imagecolorallocate($bild, 175, 175, 175);
	$farbeschwarz = imagecolorallocate($bild, 0, 0, 0);
	$logo = @imagecreatefrompng ("logosmall.png");
	ImageCopy ( $bild , $logo , 10 , 10 , 0 , 0 , 179, 29 );
	imagedestroy($logo);
	ImageTTFText($bild, 10, 0, 10, 50, $farbeschwarz, $font, $text);
	ImageTTFText($bild, 10, 0, 5, 67, $farbeschwarz, $font,"Mein Ergebnis:");
	
	$barwidth = 192 / (count($parties)+1);

	//$barwidth = 20;

	$i = 0;
	foreach ($parties as $party) 
	{
		$high=round($party["percentage"] / $maxpercent * 100);

		imagefilledrectangle($bild, 4 + $i * ($barwidth+4), 173 - $high, ($i +1) * ($barwidth+4), 173,  $farbegrau);
		ImageTTFText($bild, 8, 90, 4 + ($i+0.5) * ($barwidth+4), 173-5, $farbeschwarz, $font, $party["shortname"]);
		
		if ($party["percentage"] == 100)
			{ImageTTFText($bild, 6, 90, 4 + ($i+0.5) * ($barwidth+4), 198, $farbeschwarz, $font, $party["percentage"]."%");}
		elseif($party["percentage"] < 10)
			{ImageTTFText($bild, 7, 90, 4 + ($i+0.5) * ($barwidth+4), 193, $farbeschwarz, $font, $party["percentage"]."%");}
		else
			{ImageTTFText($bild, 7, 90, 4 + ($i+0.5) * ($barwidth+4), 198, $farbeschwarz, $font, $party["percentage"]."%");}

		
		
		$i++;
	}

	Imagepng($bild);
	imagedestroy($bild);
?>


