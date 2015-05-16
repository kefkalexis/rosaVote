function comments_buildQuestTable()
{
	//Tabelle aufbauen
	var table = "<table><tr>\n"
	for (var i = 1; i <= questionsCount; i++) 
	{
		table += "<td id=\"comments_quest_td_#\" onclick=\"showComments(#)\" title=\"{1}\">#</td>\n"
		.sharplate(i).format(questions[i].title);
		if (i % preferences.comments.qestionsInRow == 0) {table +="<tr></tr>\n"};
	};
	
	table += "</tr></table>"

	$("#comments_questTable").html(table);
	$("#comments_questTable td").mouseover(function(){$("#comments_questiontable_title").text($(this).attr("title"))})
	$("#comments_questTable td").mouseout(function(){$("#comments_questiontable_title").text("")})

	//Farben und Doppelgewichtungen setzen
	for (var i = 1; i <= questionsCount; i++) 
	{
		if(weight[i] == 2) 
			{$("#comments_quest_td_"+i).addClass("doubleweight");}
		if(answers[i] !=- 99)
			{$("#comments_quest_td_"+i).css("background-color",questStyles[questions[i].style].colors[answers[i]]);}
	}

	// Kommentarliste
	var tpl_comments = "{for party}"
					 + "<div id=\"comment_{shortname}\">"
					 + 	  "<b>{longname}</b> "
					 + 	  "<span class=\"comment_answer\"></span>"
					 + 	  "<img class=\"comment_img\" height=\"20\" width=\"20\" src=\"\">"
					 +	  "<span class=\"commentsTop commentsAddon\" onclick = \"commentsTop(event)\">(nach oben schieben)</span>"
					 +	  "<span class=\"commentsFade commentsAddon\" onclick = \"commentsFade(event)\">(ein/ausblenden)</span>"
					 + 	  "<hr>"
					 +	  "<p class=\"comment_text\" data-party=\"{shortname}\"></p>"
					 + "</div>"
					 + "{forend}"	

		data = {party: []}
		for (x in parties)
		{
			party = parties[x].shortname;
			data["party"].push({
				longname: parties[x].longname,
				shortname: parties[x].shortname
			})
		}

		$("#comments_well").html(tpl_comments.template(data))
} 


function commentsFade(e)
	{$(e.target).nextAll("p").toggle()}


function commentsTop(e)
	{
		var com_div = $(e.target).parent()
		$("#comments_well").prepend($(com_div).get(0).outerHTML);
		$(com_div).remove()
	}


function showComments(questNum)
	{
		// -------------------------------
		// Frage in Kommentarseite auswählen
		$("#commentsQuestionName").text(questions[questNum].question)
		$("#comments_quest_td_"+currentQuestNumber).removeClass("selectedcell");
		$("#comments_quest_td_"+questNum).addClass("selectedcell");


		currentQuestNumber = questNum;

		$("#comments_well").css("top", $("#comments_question_text").position().top + $("#comments_question_text").height() + 20)

		for (x in parties)
		{
			party = parties[x].shortname;
			$("#comment_" + party).children(".comment_answer").text(questStyles[questions[questNum].style].answers[questions[questNum].answers[party]]);
			$("#comment_" + party).children(".comment_text").text(questions[questNum].comments[party]);
			$("#comment_" + party).children(".comment_img").attr("src",questStyles[questions[questNum].style].icons[questions[questNum].answers[party]])
		}
	}


function next_comment_question(direction)
	{
		// -------------------------------
		// Klick auf einen der Pfeile in der Kommentaransicht
		var nextQuestNr =  currentQuestNumber + direction
		nextQuestNr = (nextQuestNr == 0) ? questions.length-1 : nextQuestNr == questions.length ? 1 : nextQuestNr
		showComments(nextQuestNr)	
	}