/*
	Send and receive messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,
	message: undefined,

	send: function(){
		var post = encodeURIComponent(this.message.value);

		if(post == "")
			return false;

		post = "message=" + post;

		Ajax.get({
			method:'POST',
			target:'bin/post.cgi',
			post:post
		});

		return true;
	},

	// Convert from 24-hour to 12-hour AM/PM time.
	time24to12: function(date){
		var date_parts = date.split(':');
		var h = date_parts[0];
		var m = date_parts[1];
		var s = date_parts[2];
		var ap = "am";

		if(h >= 12){
			h %= 12;
			ap = "pm";
		}
		if(!h)
			h = 12;

		return h + ':' + m + ':' + s + ' ' + ap;
	},

	// Write a received message out to the chatbody div.
	receive: function(msg){
		var locked = false;

		if(Message.chatbody.scrollTop === (Message.chatbody.scrollHeight - Message.chatbody.offsetHeight))
			locked = true;

		if(msg.message){
			msg.message = decodeURIComponent(msg.message);
			var tsparts = msg.timestamp.split(' ');
			var tsdate = tsparts[0];
			var tstime = tsparts[1];

			var usercolor = Chat.last.userlist[msg.user].color;
			if(!usercolor)
				usercolor = 'white';

			this.chatbody.innerHTML += '<div><span class=timestamp><span class=date>'
				+ tsdate + '&nbsp;</span><span class=time>' + this.time24to12(tstime) + '</span>'
				+ '</span> <span class=user_brackets style="color: ' + msg.ipcolor
				+ ';">[<span class=user style="color: ' + usercolor + ';">' + msg.user
				+ '</span>]</span>: <span class=message>'
				+ msg.message + '</span></div>';
		}

		if(locked)
			Message.chatbody.scrollTop = Message.chatbody.scrollHeight;
	},

	// Handle received keyboard input.
	keyhandler: function(event){
		var key = event.keyCode || event.which;

		if((!event.shiftKey) && (key === 13)){
			switch(event.type){
				case "keypress":
					Message.send();
					break;
				case "keyup":
					Message.message.value = "";
					break;
			}
		}
	},

	init: function(){
		this.chatbody = document.getElementById('chatbody');
		this.message = document.getElementById('message');

		this.message.onkeypress = this.keyhandler;
		this.message.onkeyup = this.keyhandler;

		this.message.focus();
	}
};

if(Core)
	Core.add(Message);
