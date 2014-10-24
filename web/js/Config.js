/*
	Loads user configuration JSON.
*/
var Config = {
	name: "Config",
	json: undefined,
	preferences_div: undefined,

	get: function(){
		Ajax.get({
			target: 'bin/config.cgi',
			success: function(http){
				Config.json = JSON.parse(http.responseText.trim());
				Config.setup();
			}
		});
	},

	toggle_preferences: function(set){
		var dsp = Config.preferences_div.style.display;

		Config.preferences_div.style.display = (set === undefined) ?
			((!dsp || (dsp === 'none')) ? 'inline' : 'none') :
			set ? 'inline' : 'none';
	},

	init: function(){
		document.addEventListener(Core.initcomplete.eventName, this.get);
	},

	doPreferencesUpdate: function(){
		var post = 'color=' + document.getElementById('Config.colorpicker').value;

		Ajax.get({
			post: post,
			method: 'POST',
			target: 'bin/prefs.cgi',
			completion: function(xhr){
				Config.toggle_preferences(false);
				Config.get();
			}
		});
	},

	setup: function(){
		// Login controls
		var control_left = document.getElementById('control_left');
		var content = this.json.user ?
			(this.json.user + ' (<a href="//' + authdomain + '/logout" target=_self>Logout</a>)') :
			'<a href="//' + authdomain + '/" target=_self>Login or Register</a>';
		content += ' | <a class=scriptonlylink onclick="Config.toggle_preferences();">Preferences</a>';
		control_left.innerHTML = content;

		Core.user = this.json.user;

		var color = this.json.color ? this.json.color : "";
		this.preferences_div = document.getElementById('preferences_window');
		content =
			'<div>' +
			'	<label for="Config.colorpicker">Color: #</label>' +
			'	<input id="Config.colorpicker" maxlength=6 size=6 value="' + color + '">' +
			'</div>' +
			'<div class=submitterdiv>' +
			'	<button onclick="Config.doPreferencesUpdate()">Update</button>' +
			'</div>';
		this.preferences_div.innerHTML = content;

	},
};

if(Core)
	Core.add(Config);
