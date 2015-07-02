<?php
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

?>

<html>
	<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta name="author" content="AStA KIT">
	<meta name="description" content="StuPa-O-Mat KIT 2015">
	<meta name="keywords" content="Studierendenparlament, KIT, AStA ,StuPa-O-Mat, rosaVote">
	<meta name="language" content="de">
	<meta name="Content-Language" content="de">

	<title>StuPa-O-Mat KIT 2014</title>

	<meta property="og:image" content="mystupaomat_png.php?id=<?php echo $data?>">
	<meta property="og:image:type" content="image/png">
	<meta property="og:image:width" content="200">
	<meta property="og:image:height" content="200">
	<meta property="og:description" content="Der StuPa-O-Mat für die Wahlen zum Studierendenparlament am KIT vom 6. bis 10. Juli 2015">

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@asta_am_kit" />
	<meta name="twitter:title" content="StuPa-O-Mat zru StuPa-Wahl 2015" />
	<meta name="twitter:description" content="Mein Ergebnis des StuPa-O-Mat zur Wahl des Studierendennparlaments vom 6. bis 10.7.2015." />
	<meta name="twitter:image" content="mystupaomat_png.php?id=<?php echo $data?>" />
	
	<link rel="stylesheet" type="text/css" href="mystupaomat.css">

</head>
<body>
	<div style="width: 800px; height: 400pt;text-align:center" id="container">
	<br><br><br>
	<img src="stupaomat_logo.png"  title="StuPa-O-Mat KIT 2015" alt="StuPa-O-Mat KIT 2015"><br><br>

	<h1>Mein Ergebnis:</h1>


	<table class="chartTable " style="display:inline-block;">
	<tr width="100%" height="120">
		
		<?php
		foreach($parties as $party)
			{
				$high=round( $party["percentage"]/ $maxpercent * 100);
				echo "<td class=\"charttd\">\n";
				echo "	<div class=\"chartName\">".$party["shortname"]."</div>\n";
				echo "  <div class=\"chartFakeRect\" style=\"height:12px;\"></div>\n";
				echo "  <div class=\"chartRect\" id=\"chartrect0\" title=\"".$party["longname"].":".$party["percentage"]."%\" border=\"1\" style=\"height:".$high."px;\"></div>\n";
				echo "  <div class=\"chartPercent\" id=\"chartPercent0\">".$party["percentage"]."%</div>\n";
				echo "</td>";
			};
		?>

	</tr><tr>
		
		<?php
		foreach($parties as $party)
			{
				echo "	<td>\n";
				echo "	<img src=\"../".$party["logo"]."\" class=\"chartimg\" alt=\"".$party["shortname"]."\" title=\"".$party["longname"] ."\">\n";
				echo "	</td>";
			}
		?>
	</tr>
	</table>

	<br><br>
		
	<a href="../index.html"><span class="naviButtons" title="Zur Hauptseite">Zur Hauptseite</span></a>
	<a href="../rosaVote.html"><span class="naviButtons" title="tuPa-O-Mat starten">StuPa-O-Mat starten</span></a>		
</div>
</body>
</html>