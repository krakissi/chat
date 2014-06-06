/*
	Handles receiving new messages from the chat server.
*/
var Chat = {
	name: "Chat",
	delay: 1000,
	truncate: false,
	truncate_length: 15000,

	last: undefined,
	timeout: undefined,
	newmessage: undefined,

	sleeping: false,
	sleepcounter: 0,
	sleepevent: undefined,

	lock: false,
	lockout: undefined,
	delay_lockout: 30000,

	// Poll for updates. Schedules a timeout.
	get: function(){
		clearTimeout(this.timeout);

		if(!this.lock){
			this.lock_set();	

			var http = new XMLHttpRequest();

			Ajax.get({
				target: 'bin/chat.cgi?t=' + this.last.last,
				success: function(e){
					Chat.last = JSON.parse(e.responseText.trim());

					if(Chat.last.messages){
						Chat.last.messages.forEach(function(msg){
							Message.receive(msg);
						});
						document.dispatchEvent(Chat.newmessage);
					}

					Chat.sleeptoggle(false);
				},
				unhandled: function(e){
					if((e.status === 204) && (!Chat.sleeping))
						Chat.sleepcounter++;

					if(Chat.sleepcounter > 60)
						Chat.sleeptoggle(true);
				},
				completion: function(e){
					Chat.lock_free();
				}
			});
		} else {
			console.log('Lost an update while locked');
		}

		this.timeout = setTimeout('Chat.get()', this.delay);
	},

	// Toggle sleep mode (resource saver).
	sleeptoggle: function(set){
		var was = this.sleeping;
		if(set === undefined)
			set = !was;

		this.sleeping = set;
		this.sleepcounter = 0;
		this.delay = set ? 10000 : 1000;

		if(was)
			this.get();

		document.dispatchEvent(this.sleepevent);
	},

	// Prevent queueing many requests.
	lock_set: function(){
		clearTimeout(this.lockout);
		this.lock = true;
		this.lockout = setTimeout('Chat.lock_free()', this.delay_lockout);
	},

	// Remove the lock.
	lock_free: function(){
		clearTimeout(this.lockout);
		this.lock = false;
	},

	// Stops chat from updating.
	freeze: function(){
		clearTimeout(this.timeout);
		this.lock_free();
	},

	// Toggle dates for each message's timestamp.
	toggle_dates: function(override){
		if(override === undefined)
			override = this.hide_tsdate;
		if(override === true){
			// Show dates.
			this.hide_tsdatess.innerHTML = '.timestamp .date { display: inherit; }';
			this.hide_tsdate = false;
		} else {
			// Hide dates.
			this.hide_tsdatess.innerHTML = '.timestamp .date { display: none; }';
			this.hide_tsdate = true;
		}

		return this.hide_tsdate;
	},

	init: function(){
		this.newmessage = document.createEvent("HTMLEvents");
		this.newmessage.initEvent("Message_new", true, true);
		this.newmessage.eventName = "Message_new";

		this.sleepevent = document.createEvent("HTMLEvents");
		this.sleepevent.initEvent("Sleep_changed", true, true);
		this.sleepevent.eventName = "Sleep_changed";

		this.freeze();
		this.last = {
			last: 'never'
		};

		// Dynamic stylesheet configuration.
		var sheet = document.createElement('style');
		sheet.id = 'hide_timestamp_date_stylesheet';
		document.body.appendChild(sheet);
		this.hide_tsdatess = document.getElementById(sheet.id);

		// Default to hiding dates.
		this.toggle_dates(false);

		// Start polling indefinitely.
		this.get();
	},
};

if(Core)
	Core.add(Chat);
