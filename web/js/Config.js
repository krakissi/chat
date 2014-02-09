/*
	Loads user configuration JSON.
*/
var Config = {
	name: "Config",
	json: undefined,

	get: function(){
		Ajax.get({
			target: 'bin/config.cgi',
			success: function(http){
				Config.json = JSON.parse(http.responseText.trim());
			}
		});
	},

	init: function(){
		document.addEventListener("initcomplete", Config.get);
	}
};

Core.add(Config);
