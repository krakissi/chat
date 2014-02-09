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
				target:'bin/chat.cgi?t='+this.last.last,
				success:function(e){
					Chat.last = JSON.parse(e.responseText.trim());

					if(Chat.last.messages)
						Chat.last.messages.forEach(function(msg){
							Message.receive(msg);
						});
				},
				completion:function(e){
					Chat.lock = false;
				}
			});
		} else {
			console.log('Lost an update while locked');
		}

		this.timeout = setTimeout('Chat.get()', this.delay);
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

	init: function(){
		this.freeze();
		this.last = {
			last: 'never'
		};

		// Start polling indefinitely.
		this.get();
	},
};

Core.add(Chat);
