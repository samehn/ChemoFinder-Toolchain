//////////////////////////////////////////////////////////
var english = {
	show_pharmacies: "Show Pharmacies"
};
var french = {
	show_pharmacies: "Afficher Les Pharmacies"
};
//////////////////////////////////////////////////////////
function changeLanguage() {
	document.cookie = "lang=" + $('#language').val();
	location.reload();
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
var lang = english;
if(getCookie('lang') == 'en') {
	lang = english;	
}
else if (getCookie('lang') == 'fr') {
	lang = french;	
}