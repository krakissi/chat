/*
	Manages the windows title bar
*/
var Title = {
	name: "Title",

	missedmessages: 0,
	storedtitle: undefined,

	// "constants"
	SLEEPTITLE: "Krakchat (Snoozing...)",

	// Triggered whenever sleep mode is toggled.
	sleep: function(){
		if(Title.missedmessages === 0)
			document.title = Chat.sleeping ? Title.SLEEPTITLE : Title.storedtitle;
	},

	ack: function(){
		Title.ackbox.style.display = 'none';
		Title.missedmessages = 0;
		Title.sleep();
	},

	// Message counter.
	counter: function(){
		if(!document.hasFocus() || !Message.waslocked)
			Title.missedmessages += Chat.last.messages ? (Chat.last.messages.length - 1) : 1;
		else Title.missedmessages = 0;

		if(Title.missedmessages){
			document.title = Title.missedmessages + " new message" + ((Title.missedmessages === 1) ? "" : "s") + " (Krakchat)";
			Title.ackbox.style.display = 'inline';
		} else Title.ack();
	},

	init: function(){
		this.storedtitle = document.title;
		this.ackbox = document.getElementById('missed_ack');

		document.addEventListener(Chat.sleepevent.eventName, this.sleep);
		document.addEventListener(Chat.newmessage.eventName, this.counter);
		document.addEventListener(Core.focusevent.eventName, this.counter);
	},
};

if(Core)
	Core.add(Title);
