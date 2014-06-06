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
				Config.setup();
			}
		});
	},

	init: function(){
		document.addEventListener(Core.initcomplete.eventName, this.get);
	},

	setup: function(){
		// Login controls
		var control_left = document.getElementById('control_left');
		control_left.innerHTML = this.json.user ?
			(this.json.user + ' (<a href="bin/accounts/logout" target=_self>Logout</a>)') :
			"<a href=login.html target=_self>Login or Register</a>";
		Core.user = this.json.user;

		// TODO: Set other general user preferences here. Log truncation, volume/mute, etc.
	},
};

if(Core)
	Core.add(Config);
