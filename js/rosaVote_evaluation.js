var openDetailTab = null;


function buildEvaluationTable()
	{
		// -------------------------------
		// Baut die Auswertungstabelle auf
		 var tpl_table ="<table id=\"eq{q_nr}\" class=\"evalDetailTab\">" 
		 			   +"<tr class=\"evalQuestRow\">" 
		 			   +	"<td title=\"{q_text}\"> {q_nr}: {q_title}</td>"
		 			   +	"<td class=\"ownAnswerCol\">"
			 		   +		"{if doubleWeight}"
			 		   +			"<img id=\"eval_weight_{q_nr}\" class=\"eval_weight\" height=\"20\" src=\"img/{q_weight}double_icon.png\" title=\"These wird {q_weight_text} gewertet\" data-qnr=\"{q_nr}\">"
					   +		"{ifend}"
					   +		"<img id=\"eval_answer_{q_nr}\" class=\"eval_answer\" height=\"20\" src=\"{own_anspic}\" title=\"{own_ansText}\"  data-qnr=\"{q_nr}\">"
					   +	"</td>"
					   +	"{for party}"
					   +		"<td class=\"partyAnswerCol\" title=\"{party_name}: {party_answer}, {party_comment}\">"
					   +			"<img height=\"20\" src=\"{answer_icon}\">"
					   +		"</td>"
					   +	"{forend}"
					   +"</tr>"
					   +"{if question_comments}"
					   +"<tr class=\"evalCommentsRow\">"
					   +	"<td colspan={detailTableColSpan}>"
					   +	"<table class=\"evalCommentsTab\">"
					   +		"<tr><th colspan=\"2\">{q_text}</th></tr>"
					   +		"{for party}"
					   +		"<tr>"
					   +			"<td> {party_name}</td>"
					   +			"<td>"
					   +			"<img height=\"15\" src=\"{answer_icon}\" >{party_comment} ({party_answer})"
					   +			"</td>"
					   +		"</tr>"
					   +		"{forend}"
					   +	"</table></td>"
					   +"</tr>"
					   +"{ifend}"
					   +"</table>"
		var table = ""
		var ansPic;  //aktuelles Antworticon
		var ansText;  //aktuelle Antwortbezeichnung

		for (var i = 1; i <= questionsCount; i++) 
		{
			var data = {q_nr:  i, q_text: questions[i].question, q_title: questions[i].title};

			//Gewählte Antwort und Gewichtung der Frage
			if (answers[i]!=-99)
				{data["own_anspic"] = questStyles[questions[i].style].icons[answers[i]]; data["own_ansText"] = questStyles[questions[i].style].answers[answers[i]];}
			else
				{data["own_anspic"] = "img/skip_icon.png"; data["own_ansText"] = "These übersprungen";}
			//Spalte für eigene Antwort
			if(preferences.doubleWeight)
				{
					data["doubleWeight"] = true;
					data["q_weight"] = (weight[i]== 1) ? "no":"";
					data["q_weight_text"] = (weight[i] == 1) ? "einfach": "doppelt";
				}
			// Antworten der Parteien
			
			data["party"] = []
			for(x in sortedParties)
			{
				var party = sortedParties[x];
				data["party"].push({
					party_name    : party, 
                	party_answer  : questStyles[questions[i].style].answers[questions[i].answers[party]], 
                	party_comment : questions[i].comments[party], 
                	answer_icon   : questStyles[questions[i].style].icons[questions[i].answers[party]]
	                   	});
			}
			data["detailTableColSpan"] = sortedParties.length + 2;
			data["question_comments"] = preferences.showCommentsInEvaluation

			table += tpl_table.template(data)
		}
		return table;
	}


function buildEvaluationSite()
	{
		// -------------------------------
		// Baut die Auswertungsseite auf
		evaluationCalc();
		if (preferences.evaluation.showEvaluationTable)
			{$("#evaluationTable").html(buildEvaluationTable());}
		else
			{setTimeout(function(){$("#evaluationTable").hide();},10);}

		//Vertikales Diaagramm aufbauen
		buildDiagram();

		//funktionen zum öffnen/schließen der Detailtabellen binden
		if (preferences.showCommentsInEvaluation)
		{
			$(".evalQuestRow").click(function(){showDetailTab(this)});
			$(".evalCommentsRow").click(function(){hideDetailTab(this)});
			$(".evalQuestRow").addClass("pointer");
			//$(".evalQuestRow:hover").css("background-color","red");
		};

		if(preferences.dynamicEvaluation)
			{
				$(".eval_weight").addClass("pointer");
				$(".eval_weight").bind("click", changeWeight)
				$(".eval_answer").bind("click", changeAnswer)
			};
		
		//Breiten der Spalten setzen
		$(".partyAnswerCol").css("max-width", preferences.evaluation.partyAnswerColWidth).
			css("width", preferences.evaluation.partyAnswerColWidth);
		$(".ownAnswerCol").css("width", preferences.evaluation.ownAnswerColWidth).
			css("max-width", preferences.evaluation.ownAnswerColWidth);
		
		$("#evaluationTable").scrollTop(0);
		fixWidths();
		reevaluate();
	}


function evaluationCalc()
	{
		// -------------------------------
		// Berechnet Übereinstimmung mit den Listen

		//Zuerst Anzahl maximal möglicher Punkte berechnen:
		var maxPoints = 0;
		for (var i = 1; i <= questionsCount; i++)
			{
				var pointsForQuest = 0;
				for (j in questStyles[questions[i].style].rating)
					{pointsForQuest = max(pointsForQuest, questStyles[questions[i].style].rating[j][answers[i]]);}
				questions[i].maxRating = pointsForQuest;
				if (answers[i]!=-99)
				{maxPoints += weight[i] * pointsForQuest;}
			}
		if(maxPoints == 0)
			{maxPoints = 1;}//um Division durch 0 zu verhindern

		//Alle Parteien durchgehen
		for (party in parties)
		{
			var partyPoints = 0;
			for (var i = 1; i <= questionsCount; i++)
				 {if (answers[i]!=-99)
				 	{partyPoints += weight[i] * questStyles[questions[i].style].rating[answers[i]][questions[i].answers[party]];};
				 };
			parties[party].points = partyPoints;
			parties[party].percentage = Math.round(partyPoints/maxPoints*100);
		}

		//Listen nach Übereinstimmung sortieren
		sortedParties.sort(function(a,b){return parties[b].points - parties[a].points})
	}


function reevaluate()
	{
		// -------------------------------
		// Aktualisiert Diagramm

		// Die -30 Punkte sind für Listenname und Prozentanzeige
		var maxHeight = $("#diagramTable tr").first().height()-30;
		var maxWidth = $(".horDiagTd").first().width()-45;
		var bestListPoints = parties[sortedParties[0]].percentage;
		if(bestListPoints == 0)
			{bestListPoints = 1;}
		var counterSet = {};
		for(party in parties)
		{
			//Animation der Prozentanzeige
			var proc = $(".diagramBarProc"+parties[party].shortname).data("percentage") == undefined ? 0 : $(".diagramBarProc"+parties[party].shortname).data("percentage"); 
			counterSet[party]={"proc": proc};
			$(counterSet[party]).stop().animate(
				{"proc":  parties[party].percentage},
				{
					duration:preferences.evaluation.diagramSpeed-10,
					step:(function(x){return function(now) 
						{
							$(".diagramBarProc"+parties[x].shortname).text(Math.round(now) + "%");
						}})(party),
					done:(function(x){return function() 
						{
							$(".diagramBarProc"+parties[x].shortname).text(parties[x].percentage + "%");
							$(".diagramBarProc"+parties[x].shortname).data("percentage", parties[x].percentage);
						}})(party)
				}
				);

			//Animation der Balken
			if(preferences.evaluation.showVerticalDiagram)
			{
				$("#diagramBar"+parties[party].shortname).stop().animate(
					{height : parties[party].percentage/bestListPoints*maxHeight+10}, 
					{duration:preferences.evaluation.diagramSpeed}
					);
			}

			if(preferences.evaluation.showHorizontalDiagram)
			{
				x = Math.round(parties[party].percentage/bestListPoints*maxWidth);
				if (x<1){x=1};
				$("#hdiagramBar"+parties[party].shortname).stop().animate(
					{width : x}, 
					{duration:preferences.evaluation.diagramSpeed}
					);
			}
		}
	}


function buildDiagram()
	{
		// -------------------------------
		// Diagramme aufbauen
		if (preferences.evaluation.showHorizontalDiagram)
			{$("#horizontal_diagram").html(buildHorizontalDiagram())}

		var tpl_diagram = "<table id=\"diagramTable\">"
						+ "{if verticalDiagram}{verticalDiagram}{ifend}"
						+ "<tr id=\"partyRow\">"
						+ 	"<td class=\"ownAnswerCol\" >"
						+		"<div class=\"partyrow\">{textOverOwnAnswerCol}</div>"
						+	"</td>"
						+	"{for party}"
						+ 	"<td class=\"partyAnswerCol\" title=\"{longname}\">"
						+		"<div class=\"partyrow partyAnswerCol\">{logo}</div>"
						+	"</td>"
						+	"{forend}"
						+"</tr></table>";

		var data = {textOverOwnAnswerCol : preferences.evaluation.textOverOwnAnswerCol}
		if (preferences.evaluation.showVerticalDiagram)
			{data["verticalDiagram"] =  buildVerticalDiagram();}
		data["party"] = []
		for(x in sortedParties)
		{
			var party = sortedParties[x];
			logo = preferences.evaluation.showNamesInsteadOfLogos ? parties[party].shortname : "<img src=\"{1}\" style=\"max-width:{2};max-width:{3}\">"
					.format(parties[party].logo, preferences.evaluation.partyAnswerColWidth, preferences.evaluation.partyRowHeight)		
			data["party"].push({
				longname : parties[party].longname,
				logo: imageClickAction(logo, party)
				
			})																								
		}
		$("#tableheader").html(tpl_diagram.template(data));
	
	//Höhe setzen
		$("#verticalDiagram").css("height", preferences.evaluation.verticalDiagramHeight).
			css("max-height", preferences.evaluation.verticalDiagramHeight);
		$(".partyRow").css("height", preferences.evaluation.partyRowHeight).
			css("max-height", preferences.evaluation.partyRowHeight);
		$(".diagramBarProc").data("percentage", 0);
	}


function buildVerticalDiagram()
	{
		// -------------------------------
		// Vertikales Diagramm
		var vertDiag = ""
		var tpl_vert_diag = "<tr id=\"verticalDiagram\"><td></td>"
						  + "{for party}" 
						  + "<td class=\"partyAnswerCol\" title=\"{longname}\">"
						  + "{shortname}<br><div class=\"diagramBar vertDiagramBar\" id=\"diagramBar{shortname}\">"
						  + 	"<span class=\"diagramBarProc{shortname}\">0%</span>"
						  + "</div></td>"
						  + "{forend}"
						  + "<tr>"

		vertDiag += "<tr id=\"verticalDiagram\"><td></td>"
		var data = {party:[]}
		for(x in sortedParties)
		{
			var party = sortedParties[x];
			data["party"].push({
				shortname:parties[party].shortname, 
				longname:parties[party].longname
			})

		}
		return tpl_vert_diag.template(data);
	}

function buildHorizontalDiagram()
	{
		// -------------------------------
		// Horizontales Diagramm
		var tpl_vert_diag = "<table>"
						  + "{for party}" 
						  + "<tr title=\"{longname}\">"
						  +		"<td>{logo}</td>"
						  +		"<td class=\"nowrap horDiagTd\" width=\"{width}\">"
						  +			"<div class=\"diagramBar horDiagramBar\" id=\"hdiagramBar{shortname}\" style=\"height: {height}; width:2px\"> {longname}</div><span class=\"diagramBarProc{shortname}\">0%</span>"
						  +		"</td>"
						  + "{forend}"
						  + "</table>"

		var data ={party:[]}
		for(x in sortedParties)
		{
			var party = sortedParties[x];
			partylogo = "<img src=\"{1}\" style=\"max-height:{2}\">".format(parties[party].logo, preferences.evaluation.horizontalBarHeight);

			data["party"].push({
				longname : parties[party].longname,
				shortname : parties[party].shortname,
				logo: imageClickAction(partylogo, party),
				width : preferences.evaluation.horizontalDiagramWidth,
				height : preferences.evaluation.horizontalBarHeight
			})
		}

		return tpl_vert_diag.template(data);
	}


function showDetailTab(what)
	{
		// -------------------------------
		// Kommentare in Auswertungstabelle öffnen
		$().finish();
		var commentTab = $(what).next();

		if ($(commentTab).is(".openDetailTab"))
			{hideDetailTab(commentTab);}
		else
		{
			if(openDetailTab)
				{hideDetailTab(openDetailTab);}
			openDetailTab =  $(what).next();
			$(openDetailTab).children().children().hide();
			$(openDetailTab).show();
			$(openDetailTab).addClass("openDetailTab");
			$(openDetailTab).children().children().slideDown({"duration":preferences.evaluation.tableAnimationSpeed,"complete":function(){scrollIntoView(openDetailTab);}});

		}
	}


function hideDetailTab(what)
	{
		// -------------------------------
		// Kommentare in Auswertungstabelle schlißeßen
		$(what).children().children().stop();
		$(what).children().children().slideUp(preferences.evaluation.tableAnimationSpeed);
		$(openDetailTab).removeClass("openDetailTab")
		openDetailTab = null;
	}


function scrollIntoView(what)
	{
		// -------------------------------
		// Kommentartaelle in Auswertungstabelle in Bild scrollen		
		what = $(openDetailTab).parents("table");
		var bottomDiff = $(what).position().top + $(what).height() + 3 - $("#evaluationTable").height();
		var scrollDiff = max(bottomDiff, 0);
		var topDiff = $(what).position().top - scrollDiff;
		scrollDiff += min(topDiff, 0);
		if (scrollDiff != 0)
			{$("#evaluationTable").animate({"scrollTop":"+=" + scrollDiff},preferences.evaluation.tableAnimationSpeed);}
	}


function changeWeight(event)
	{
		// -------------------------------
		// Klick auf die Wertungs-icons
		questNum = $(event.delegateTarget).data("qnr");

		if(!preferences.dynamicEvaluation){return;};
		weight[questNum] = weight[questNum] == 1 ? 2 : 1;
		$("#eval_weight_" + questNum).attr("src", "img/#double_icon.png".sharplate(weight[questNum] == 1 ? "no" : ""));
		$("#eval_weight_" + questNum).attr("title", "These wird # gewertet".sharplate(weight[questNum] == 1 ? "einfach" : "doppelt"));
		//"These wird # gewertet".sharplate(weight[questNum] == 1 ? "einfach":"doppelt"))
		event.stopImmediatePropagation();
		evaluationCalc();
		reevaluate();
	}


function changeAnswer(event)
	{
		// -------------------------------
		// Klick auf die Eigene-Meinung-Icons	
		questNum = $(event.delegateTarget).data("qnr");
		if(!preferences.dynamicEvaluation){return;};
		var style = questions[questNum].style;
		answers[questNum]++;
		if (answers[questNum] == -98)
			{answers[questNum] = 0}
		if (answers[questNum] == questStyles[style].answers.length)
			{answers[questNum] = -99}
		var ansPic;  //aktuelles Antworticon
		var ansText;  //aktuelle Antwortbezeichnung
		if (answers[questNum] != -99)
			{
				ansPic = questStyles[style].icons[answers[questNum]];
				ansText = questStyles[style].answers[answers[questNum]];
			}
		else
			{ansPic = "img/skip_icon.png"; ansText = "These übersprungen";}
		$("#eval_answer_"+questNum).attr("src", ansPic).attr("title", ansText);
		event.stopImmediatePropagation();
		evaluationCalc();
		reevaluate();
	} 


function fixWidths()
	{
		// -------------------------------
		//Abstände werden korrigiert, damit Fragentabelle und Parteiendiagramm zusammenpassen
		//Höhe der Auswertungstabelle setzen
		$("#evaluationTable").css("top",$("#tableheader").position().top + $("#tableheader").height());
		var questionwidth = $(".evalQuestRow td").first().outerWidth()
		$("#lefttop_space").css("width", questionwidth)

	}


function imageClickAction(img, party)
	{	
		// -------------------------------
		// Bild wird mit Link oder Click-Action ausgestattet
		if (preferences.evaluation.logoClickAction == "link")
			{img = "<a href=\"#\" target=\"_blank\" >".sharplate(parties[party].website) + img + "</a>"}
		if (preferences.evaluation.logoClickAction == "iframe" || preferences.evaluation.logoClickAction == "load")
			{img = "<span class=\"pointer\" onclick=\"clickAction(event, '#');\">".sharplate(party) + img + "</span>"};
		return img;
	}	


function clickAction(event, party)
	{
		// -------------------------------
		// Klick auf Parteienlogo		
		$("#overlay").empty();
		if (preferences.evaluation.logoClickAction == "iframe")
			{$("#overlay").html("<iframe  src=\"#\" width=\"100%\" height=\"100%\"></iframe>".sharplate(parties[party].website));}
		if (preferences.evaluation.logoClickAction == "load")
			{$("#overlay").load(parties[party].website);}
		$("#overlay").show();
		event.stopPropagation();
	}	
		
