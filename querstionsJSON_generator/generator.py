import os
 
parties = os.listdir('parties')

partyDict={};

for party in parties:
	with open('parties/'+party) as file:
		partyDict[party] = file.readlines()

with open('questions.csv') as file:
	questions = file.readlines()

jsontext=""
jsonquestions = []


for i in range(0,len(questions)):
	quest = questions[i]
	jsonquest=""
	jsonquest += "  {\n"
	questdata = quest.split("	")
	jsonquest += "    \"title\": \"{}\",\n".format(questdata[1])
	jsonquest += "    \"question\": \"{}\",\n".format(questdata[2].replace("\"","\'"))
	jsonquest += "    \"annotation\": \"{}\",\n".format(questdata[3].strip().replace("\"","\'"))
	jsonquest += "    \"style\": \"{}\",\n".format(questdata[0])
	jsonanswers = []
	for party in parties:
		jsonanswers.append("\"{}\":{}".format(party, partyDict[party][i].split("	")[0]))
	jsonquest += "    \"answers\": {} \n".format("{"+",".join(jsonanswers)+"},")
	jsonquest += "    \"comments\":\n"
	jsonquest += "      {\n"
	jsoncomments = []
	for party in parties:
		jsoncomments.append("      \"{}\":\"{}\"".format(party, partyDict[party][i].split("	")[1].strip().replace("\"","\'")))
	jsonquest += ",\n".join(jsoncomments)+"\n"
	jsonquest += "      }\n"
	
	jsonquest += "  }"
	
	jsonquestions.append(jsonquest)

jsontext =  "[\n"+",\n".join(jsonquestions)+"\n" + "]"
	
print (jsontext)

file = open("questions.JSON","w")
file.write(jsontext)
file.close