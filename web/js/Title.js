/*
	Manages the windows title bar
*/
var Title = {
	name: "Title",

	storedtitle: undefined,

	// "constants"
	SLEEPTITLE: "Krakchat (Snoozing...)",

	// Triggered whenever sleep mode is toggled.
	sleep: function(event){
		if(Chat.sleeping){
			if(Title.storedtitle != document.title)
				Title.storedtitle = document.title;
			document.title = Title.SLEEPTITLE;
		} else document.title = Title.storedtitle;
	},

	init: function(){
		this.storedtitle = document.title;

		document.addEventListener(Chat.sleepevent.eventName, Title.sleep);
	},
};

if(Core)
	Core.add(Title);
