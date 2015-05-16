// DEFINITIONEN


///////////////////////////////////////////////////////////////////////
// ALLGEMEINE/EINFACHE EINSTELLUNGEN:

//fragentypen definieren
var questionStyles= "questStyles";
// FRAGENKATALOG
var fileQuestions = "fragen.csv";


// LISTE DER PARTEIEN/KANDIDATEN (mit Semikolon trennen, Reihenfolge beachten )
// Liste der Parteipositionen und Begruendungen
var strPartyFiles = "rcds; liste; fips; lust; jusos; gal; piraten;lhg";
// Liste der Parteinamen - kurz 
var strPartyNamesShort = "RCDS; LISTE; FiPS; LuSt; Juso; GAL; PIRATEN; LHG";
// Liste der Parteinamen - lang
var strPartyNamesLong ="RCDS - Die CampusUnion; Liste für basisdemokratische Initiative Tierzucht und Elitenbeförderung (Die LISTE); Fachschaftler im Parlament der Studierenden (FiPS); Liste unabhängiger Studierender; Jusos – studentisch.demokratisch. solidarisch.; GAL – Grüne Alternative Liste; PIRATEN-Liste; Liberale Hochschulgruppe (LHG)";
// Websites der Parteien
var strPartyWebsites = "http://www.rcds-ka.de/;http://liste-ka.de/;http://www.fips-ka.org/;http://www.lust-ka.de/;http://www.jusohsg-karlsruhe.de/;http://galka.blogsport.de/;http://karlsruhe.piratenhochschulgruppe.de/;http://lhg-karlsruhe.de/";
// Logos der Parteien (sollten im Format 50x25px sein)
var strPartyLogosImg = "logo_rcds.png;logo_liste.png;logo_fips.png;logo_lust.png;logo_juso2.png;logo_gal.png;logo_piraten.png;logo_lhg.png";
var intPartyLogosImgWidth = 50;
var intPartyLogosImgHeight = 25;


// Hauptueberschrift
var headline = "StuPa-O-Mat";
//Title-Eigenschaft der Website
var webTitle = "StuPa-O-Mat - powered by RosaVote";



///////////////////////////////////////////////////////////////////////
// ERWEITERTE EINSTELLUNGEN:

// Trennzeichen fuer die CSV-Dateien (Excel benutzt haeufig Semikolon, OpenOffice ein Komma)
var separator = ";";

// Designvorlage (CSS) im Ordner /styles 
var design = "default";
