/*
	Handles chirps and mention noises.
*/
var Sound = {
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
	mute: function(){
		Sound.bloop.muted = Sound.horn.muted = Sound.chirp_mute.checked;
	},

	// Adjust volume attenuation.
	atten: function(){
		Sound.bloop.volume = Sound.horn.volume = Sound.chirp_vol.value;
		Sound.bloop.play();
	},

	init: function(){
		this.bloop = this.load('snd/chirp.wav');
		this.horn = this.load('snd/horn.wav');

		this.chirp_mute = document.getElementById('chirp_mute');
		this.chirp_vol = document.getElementById('chirp_vol');

		this.chirp_mute.addEventListener("change", Sound.mute);
		this.chirp_vol.addEventListener("change", Sound.atten);
	}
};

Core.add(Sound);
