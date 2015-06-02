
var currentQuestNumber = 0;

function showQuestion(questNum, fadeSpeed)
	{
		// -------------------------------
		// Zeigt eine Frage
		if(!questNum) {questNum = currentQuestNumber+1;}
		if (questNum > questionsCount)
			{currentQuestNumber=1;showSiteEvaluation();return;}
		if (fadeSpeed == undefined) {fadeSpeed = preferences.questions.fadeSpeed} 
		$("#question_title").fadeText("Frage {1}/{2} - {3}".format(questNum,questionsCount, questions[questNum].title), fadeSpeed);
		$("#question_text").fadeText(questions[questNum].question, fadeSpeed)
		$("#question_explenation").fadeText(questions[questNum].annotation, fadeSpeed);
		$("#quest_td_"+currentQuestNumber).removeClass("selectedcell");
		$("#quest_td_"+questNum).addClass("selectedcell");
		$("#answerbuttons").html(questStyles[questions[questNum].style].styleButtons);
		$("#weightimage").attr("src",weight[questNum] == 1 ? "img/nocheck.png": "img/check.png");
		currentQuestNumber = questNum;
	}


function chooseAnswer(answer)
	{
		// -------------------------------
		// Antwort auswählen
		answers[currentQuestNumber] = answer;
		$("#quest_td_"+currentQuestNumber).css("background-color",questStyles[questions[currentQuestNumber].style].colors[answer]);
		showQuestion();
	}


function skipQuestion()
	{
		// -------------------------------
		// Frage überspringen
		answers[currentQuestNumber] = -99;
		$("#quest_td_"+currentQuestNumber).css("background-color","");
		showQuestion();
	}


function doubleWeight()
	{
		// -------------------------------
		// Frage doppelt gewichten
		$("#quest_td_"+currentQuestNumber).toggleClass("doubleweight")
		weight[currentQuestNumber] = weight[currentQuestNumber] == 1  ? 2 : 1;
		$("#weightimage").attr("src", weight[currentQuestNumber] == 1 ? "img/nocheck.png": "img/check.png");
	}


function buildQuestTable()
	{
		// -------------------------------
		// Tabelle aufbauen

		var table = "<table><tr>\n"
		for (var i = 1; i <= questionsCount; i++) 
		{
			table += "<td id=\"quest_td_#\" onclick=\"showQuestion(#)\" title=\"{1}\">#</td>\n"
			.sharplate(i).format(questions[i].title);
			if (i % preferences.questions.qestionsInRow == 0) {table +="<tr></tr>\n"};
		};
		
		table += "</tr></table>"
		$("#questTable").html(table);
		$("#questTable td").mouseover(function(){$("#questiontable_title").text($(this).attr("title"))})
		$("#questTable td").mouseout(function(){$("#questiontable_title").text("")})

		//Farben und Doppelgewichtungen setzen
		for (var i = 1; i <= questionsCount; i++) 
		{
			if(weight[i] == 2) 
				{$("#quest_td_"+i).addClass("doubleweight");}
			if(answers[i] !=- 99)
				{$("#quest_td_"+i).css("background-color",questStyles[questions[i].style].colors[answers[i]]);}
		}
	} 
