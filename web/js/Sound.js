/*
	Handles chirps and mention noises.
*/
var Sound = {
	// Sounds
	bloop: undefined,
	horn: undefined,

	init: function(){
		this.bloop = this.load('snd/chirp.wav');
		this.horn = this.load('snd/horn.wav');
	},

	// Load an audio file.
	load: function(uri){
		var audio = new Audio();
		return audio;
	}
};

Core.add(Sound);
