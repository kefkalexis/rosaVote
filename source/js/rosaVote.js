
var parties = []; var partiesCount = 0;
var questStyles = [];
var questions = []; var questionsCount = 0; 
var preferences = {} //Eigenschaften-Objekct

var loadedfiles = 0; // Anzal der geladenen JSON-Files
var filestoload = 4; // Anzahl der zu ladenden Dateien

var answers = []; // Antworten des Nutzers
var weight = []; // Gewichtung der Fragen
var sortedParties = [] //um später die Parteien nach Übereinstimmung zu sortieren

var activeSite = "" //Welche Ansicht wird gerade angezeigt

var mobile_modus = false; // falls das Bild zu schmal sein sollte

//////////////////////
// --- Daten laden ---

function loadData()
	{
	//----------------------------
	//Daten aus JSON-Dateien laden
		$.getJSON("data/perties.JSON")
			.done(function(data){parties = data;loadedfiles++;init();})
			.fail(function(){alert("Fehler beim Laden der Parteien")});
		$.getJSON("data/quest_styles.JSON")
			.done(function(data){questStyles = data;loadedfiles++;init();})
			.fail(function(){alert("Fehler beim Laden der Fragentypen")});
		$.getJSON("data/questions.JSON")
			.done(function(data){questions = [0].concat(data);loadedfiles++;init();})
			.fail(function(){alert("Fehler beim Laden der Fragen")});		
		$.getJSON("data/preferences.JSON")
			.done(function(data){preferences = data ;loadedfiles++;init();})
			.fail(function(){alert("Fehler beim Laden der Einstellungen")});		
	} 

function init () 
	{
		// ------------------------------
		// Initialisierung von rosaVote
		if(loadedfiles < filestoload){return};


		partiesCount = parties.length;

		//questions[0] ist ein dummy, damit man weniger Indexschererien hat, erste Frage ist also questions[0]
		questionsCount = questions.length - 1;

		// Antworten und Gewichte initialisieren
		for (var i = 1; i <= questionsCount; i++) 
		{
			answers[i] = -99; //-99 bedeutet Frage übersprungen
			weight[i] = 1;
		}

		// Text in Überspringen- und Gewichtungsbutton eintragen
		if (!preferences.questions.skipAndWeightInNewLine)
			{$("#skipWeightButtons").empty();}
		else
		{
			$("#skipText").text(preferences.questions.skipText + (preferences.questions.showKeyNumbers ? " (0)" : ""));
			$("#doubleWeightText").text(preferences.questions.doubleWeightText);
		}

		//Text in Feld über Fragentabelle eintragen
		$("#directLinkText").text(preferences.questions.directLinkText);
		$("#comments_directLinkText").text(preferences.comments.directLinkText);

		//QuestionStyles anlegen
		for (style in questStyles)
		{
			var ansCount = questStyles[style].answers.length; //Anzahl der Antwortmöglichkeiten im Style
			var styleButtons = "";
			//Buttons für die Antwortmöglichkeiten anzeigen
			for(var i = 0; i < ansCount; i++)
			{
				styleButtons += "<div class=\"question_button\" onclick=\"chooseAnswer({1})\" style=\"background-color:{2}\">"
				.format(i, questStyles[style].colors[i]);
				if (preferences.questions.showAnswerIcons)
				{
					styleButtons += "<img src=\"{1}\" width=\"{2}\" height=\"{3}\">"
									.format(questStyles[style].icons[i], 
									preferences.questions.answerIconsWidth,
									preferences.questions.answerIconsHeight);
				}
				
				styleButtons += "{1} {2} {3} </div>"
								.format(
									preferences.questions.wrapAfterIcon ? "<br>" : "", 
									questStyles[style].answers[i],
									preferences.questions.showKeyNumbers ? " (#)".sharplate(i+1) : ""
								);
			}
			if (!preferences.questions.skipAndWeightInNewLine)
			{
				styleButtons += "<div class=\"question_button\" onclick=\"skipQuestion()\">"
							 +  (preferences.questions.showAnswerIcons ? "<img src=\"img/skip_icon.png\" class=\"answerIcon\" id=\"skipIcon\">" : "")
							 +  (preferences.questions.wrapAfterIcon ? "<br>" : "")
							 +  preferences.questions.skipText
							 +  (preferences.questions.showKeyNumbers ? " (0)" : "")
							 +  "</div>";
				if(preferences.doubleWeight)
					{styleButtons += "<div id=\"doubleWeightButton\" class=\"question_button\" onclick=\"doubleWeight()\" >  <img src=\"img/check.png\" id=\"weightimage\" class=\"answerIcon\">#</div>"
										.sharplate((preferences.questions.wrapAfterIcon ? "<br>" : "") + preferences.questions.doubleWeightText);;}

			}
			questStyles[style].styleButtons = styleButtons;
			//maximal erreichbare Punkte bei diesem Queststyle	
			var maxPoints = 0;
			for (j in questStyles[style].rating)
				{maxPoints = Math.max(arrmax(questStyles[style].rating[j]), maxPoints);};
			questStyles[style].maxRating = maxPoints;
		}

		//Parteienliste vorbereiten
		for (party in parties)
			{sortedParties.push(party);}
		
		//Soll Button für doppelte Wertigkeit angezeigt werden
		if(preferences.doubleWeight)
			{$("#doubleWeightButton").show();}

		//Button-Icons formatieren
		if (!preferences.questions.showAnswerIcons)
			{$("#skipIcon").hide();}
		$(".answerIcon").width(preferences.questions.answerIconsWidth);
		$(".answerIcon").height(preferences.questions.answerIconsHeight);

		//Soll ein Homepagelink angezeigt werden
		if(preferences.homepage == "")
			{$("#hompageBtn").hide();}

		//Titel und Überschrift setzen
		$("#headline").html(preferences.headline);
		$(document).attr("title",preferences.homepgageTitle);

		// Style einbinden
		$("<link/>", {rel: "stylesheet",type: "text/css",href: "css/theme_#.css".sharplate(preferences.theme)}).appendTo("head");

		//favicon setzen
		if (preferences.favicon!="")
			{$("<link/>", {rel: "icon",type: "image/png", href: preferences.favicon}).appendTo("head");}

		$("#overHorDiagram").html(preferences.evaluation.overHorDiagram)
		$("#overEvalTable").html(preferences.evaluation.overEvalTable)

		showSiteQuestions(); //Fragenseite anzeigen
		if (preferences.startFadeTime)
			{$("#rosaVoteContainer").fadeIn(preferences.startFadeTime);}
		else 
			{$("#rosaVoteContainer").show();}

		//Counter
		if (preferences.counter !="")
			{$.ajax({method: "GET",url:preferences.counter, dataType: "html"});}

		//Links
		$("{for links}<a href=\"{url}\">{name} </a> {forend}".template({links: preferences.links})).insertAfter("#rosaVoteContainer");

	}


$(function() 
	{
		// ------------------------------------------------
		// Initialisierung, wird nach DOM-Aufbau aufgerufen
		loadData();
	});


$(window).on("click", function()
	{
		// ------------------------------------------------
		// Overlay bei Click wieder ausblenden
		if($("#overlay").is(":visible")){$("#overlay").hide();}
	});


$(window).keypress(function( event )
	{
		// ------------------------------------------------
		// Antworten können mittel Tasten 1 bis 9 gegeben werden
		if (activeSite = "questions" && !isNaN(event.key) )
		{
			key = parseInt(event.key);
			if (key > 0 && key <= questStyles[questions[currentQuestNumber].style].answers.length)
				{chooseAnswer(key-1);};
			if(key == 0)
				{skipQuestion()}

		}
	});


function homepage()
	{
		// ---------------------------
		// Klick auf Startseite-Button
		window.location = preferences.homepage;
	}

/////////////////////////////
// --- Ansichten wechseln ---

function showSiteQuestions()
	{
		// ----------------------
		// Fragen-Seite anzeigen
		activeSite = "questions";
		buildQuestTable();
		$(".questionSite").show();
		$(".evaluationSite").hide();
		$(".commentsSite").hide();
		$("#rosaVoteContainer").css("height",preferences.dimensions.questionsiteHeight);
		$("#rosaVoteContainer").css("width",preferences.dimensions.questionsiteWidth);
		showQuestion(currentQuestNumber, 0);
	}

function showSiteEvaluation()
	{
		// ---------------------------
		// Auswertungs-Seite anzeigen
		activeSite = "evaluation";
		$(".questionSite").hide();
		$(".evaluationSite").show();
		$(".commentsSite").hide();
		$("#rosaVoteContainer").css("height",preferences.dimensions.evaluationsiteHeight);
		$("#rosaVoteContainer").css("width",preferences.dimensions.evaluationsiteWidth);
		
		buildEvaluationSite();
	}

function showSiteComments()
	{
		// ---------------------------
		// Kommentare-Seite anzeigen
		activeSite = "comments";
		comments_buildQuestTable()
		$(".questionSite").hide();
		$(".evaluationSite").hide();
		$(".commentsSite").show();
		$("#rosaVoteContainer").css("height",preferences.dimensions.commentssiteHeight);
		$("#rosaVoteContainer").css("width",preferences.dimensions.commentssiteWidth);
		
		showComments(currentQuestNumber)

	}


//////////////////////////
// --- Hilfsfunktionen ---

String.prototype.sharplate = function(replace)
	{
		// ----------------------------
		// ersetzt alle # durch replace
		s=this;
		s.replaceAll("#", replace);
		return s
	};

String.prototype.format = function() 
	{
		// --------------------------------------------------------------
		// Template-Funktion. {i} in string wird durch Argument i ersetzt
		var s = this,
			i = arguments.length;

		while (i--) {
			s = s.replace(new RegExp('\\{' + (i+1) + '\\}', 'gm'), arguments[i]);
		}
		return s;
	};

String.prototype.replaceAll = function(find, replace)
	{
		// ---------------------------------------------------------------
		// Alle Vorkommnisse von find in string wird durch replace ersetzt

		if(find == ""){return;}
		//Hilfsfunktion, ersetzt in einem String alle vorkommnisee
		s = this;
		while (s.indexOf(find) !== -1)
			{s = s.replace(find,replace);}
		return s;
	};

function arrmax(arr)
	{
		// ---------------------------------
		//gibt maximum eines arrays zurück
		return Math.max.apply(null, arr);
}

var max = Math.max;
var min = Math.min;

function getRandomColor() 
	{
		// --------------------------------
		// gibt eine zufällige Farbe zurück
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) 
	    	{color += letters[Math.floor(Math.random() * 16)];}
	    return color;
}

$.fn.fadeText = function(text, duration)
	{
		//  ----------------------------------------------------------------
		// Object wird ausgefaded, durch Text ersetzt und wieder eingefaded
		this.stop(); // bisherige Animation stoppen
		var object = this;
		if(duration == undefined) {duration = preferences.questions.fadeSpeed;};
		if(duration == 0)
			{this.html(text);}
		else
		{
			this.fadeOut(duration)
				.queue(function(){object.html(text);object.dequeue();})
				.fadeIn(duration);
		}
	};


String.prototype.template = function(data) 
	{
		//minimale Templatengine
		//Beispiel : "Hallo {vorname}{if nachname} {nachname}{ifend}!".template({vorname:"Karl"}) --> "Hallo Karl!"
		//Beispiel : "Hallo {vorname}{if nachname} {nachname}{ifend}!".template({vorname:"Karl", nachname:"Marx"}) --> "Hallo Karl Marx!"
		var s = this;
		var result = "";
		var position = 0;
		var nextPos = 0;

		while(nextPos = s.indexOf("{",position)+1)
		{
			result += s.substring(position, nextPos-1);
			var tagEndPos = s.indexOf("}",nextPos);
			var tagName = s.substring(nextPos, tagEndPos);
			if (tagName.substring(0, 3) == "for")
				{
					var endforpos = s.indexOf("{forend}", nextPos + 3);
					var loop_var = tagName.substr(4)
					var loop_content = s.substring(s.indexOf("}", nextPos + 3)+1, endforpos)		
					for (x in data[loop_var])
						result += loop_content.template(data[loop_var][x])


					position = endforpos + 8;
				}

			else if (tagName == "forend")
				{}

			else if (tagName == "ifend")
				{position = tagEndPos+1;}

			else if (tagName.substring(0, 2) == "if")
				{
					if(data[tagName.substr(3)])
						{position = tagEndPos+1;}
					else
						{position = s.indexOf("{ifend}",tagEndPos) + 7;}
				}

			else
				{
					result += data[tagName];
					position = tagEndPos+1;
				}
		}

		result += s.substr(position);
		return result;
	};