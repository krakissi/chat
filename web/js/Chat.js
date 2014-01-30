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

	// Poll for updates. Schedules a timeout.
	get: function(){
		clearTimeout(this.timeout);

		var http = new XMLHttpRequest();

		// TODO: Implement a backend to connect with first.
		Ajax.get({
			target:'bin/chat.cgi?t='+this.last.last,
			success:function(e){
				this.last = JSON.parse(e.responseText.trim());
			},
		});

		this.timeout = setTimeout('Chat.get()', this.delay);
	},

	// Stops chat from updating.
	freeze: function(){
		clearTimeout(this.timeout);
	},

	init: function(){
		clearTimeout(this.timeout);

		this.last = {
			last: 'never',
		};

		// Start polling indefinitely.
		this.get();
	},
};

Core.add(Chat);
