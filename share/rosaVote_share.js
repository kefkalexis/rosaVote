var sharediv = "<div id=\"sharediv\" class=\"evaluationSite\" style=\"position:absolute; right:10px\">"
		     + 		"<img src=\"share/share.png\" onclick=\"share()\" title=\"Ergebnis teilen\">"
		     + 		"<img src=\"share/facebook.png\" onclick=\"share_fb()\" title=\"Auf facebook teilen\">"
		     +		"<img src=\"share/twitter.png\" onclick=\"share_twit()\" title=\"Auf twitter teilen\">"
		     + "</div>"


var sharelink = "www.asta-kit.de/Wahl/Wahl14/stupa-o-mat/mystupaomat.php";
var twittertext = "Mein%20%23stupaomat%20Ergebnis%20f%C3%BCr%20die%20Stupa-Wahl%20am%20%40KITKarlsruhe:%20";

$(function() 
	{
		$(sharediv).insertAfter("#overHorDiagram");
		setTimeout(function(){$("#sharediv").css("top",$("#navigation").position().top + $("#navigation").height())},200)
		$("#sharediv img").addClass("pointer");
		
	})

function create_share_url()
	{
		var code = ""
		var seed = Math.round(100*Math.random());
		var checksum = 0;
		
		code += seed < 16 ? "0" : "";
		code += seed.toString(16);
		checksum += seed;
		for(x in parties)
		{
			code += seed + parties[x].percentage < 16 ? "0" : "";
			code +=  (seed + parties[x].percentage).toString(16);
			checksum += parties[x].percentage;
		}

		checksum = checksum % 256;

		code += checksum < 16 ? "0" : "";
		code += checksum.toString(16);

		var url = sharelink + "?id=" + code;
		return url
	}


function share()
	{
		window.prompt("Mit diesem Link kannst du dein Ergebnis mit anderen teilen:\n(Strg+C zum kopieren)", create_share_url());
	}


function share_fb()
	{
		newwindow = window.open('https://www.facebook.com/sharer/sharer.php?u=' + create_share_url(),"_blank",'height=200,width=400');
		if (window.focus) {newwindow.focus()}
		return false;	
	}


function share_twit()
	{
		newwindow = window.open('https://twitter.com/home?status=' +  twittertext + create_share_url(),"_blank",'height=200,width=400');
		if (window.focus) {newwindow.focus()}
		return false;		
	}

		
