/*
	Handles chirps and mention noises.
*/
var Sound = {
	name: "Sound",

	// Sounds
	bloop: undefined,
	horn: undefined,

	chirp_mute: undefined,
	chirp_vol: undefined,

	// Load an audio file.
	load: function(uri){
		var audio = new Audio();
		audio.src = uri;

		return audio;
	},
	
	// Mute sounds.
	mute: function(force){
		localStorage.setItem("Sound.muted", Sound.bloop.muted = Sound.horn.muted = (force === true) ? true : Sound.chirp_mute.checked);
	},

	// Adjust volume attenuation.
	atten: function(bloop){
		localStorage.setItem("Sound.volume", Sound.bloop.volume = Sound.horn.volume = Sound.chirp_vol.value);
		if(!(bloop === false))
			Sound.bloop.play();
	},

	messagealert: function(){
		if(Sound.bloop.muted === false){
			// Chrome sucks.
			if(window.chrome)
				Sound.bloop.load();

			Sound.bloop.play();
		}
		Sound.mute();
	},

	init: function(){
		this.bloop = this.load('snd/chirp.wav');
		this.horn = this.load('snd/horn.wav');

		this.chirp_mute = document.getElementById('chirp_mute');
		this.chirp_vol = document.getElementById('chirp_vol');

		var ls_muted = localStorage.getItem("Sound.muted");
		this.chirp_mute.checked = (ls_muted && (ls_muted == "true"));
		var ls_vol = localStorage.getItem("Sound.volume");
		this.chirp_vol.value = (ls_vol || (ls_vol === "0")) ? ls_vol : this.chirp_vol.value;

		this.chirp_mute.addEventListener("change", Sound.mute);
		this.chirp_vol.addEventListener("change", Sound.atten);


		// Sync sound settings with controls.
		this.atten(false);
		this.mute(true);

		// Listen for new messages to bloop at.
		document.addEventListener(Chat.newmessage.eventName, this.messagealert);
	}
};

if(Core)
	Core.add(Sound);
