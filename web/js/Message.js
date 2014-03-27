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

	// Write a received message out to the chatbody div.
	receive: function(msg){
		var locked = false;

		if(Message.chatbody.scrollTop === (Message.chatbody.scrollHeight - Message.chatbody.offsetHeight))
			locked = true;

		if(msg.message){
			msg.message = decodeURIComponent(msg.message);
			this.chatbody.innerHTML +='<div><span class=timestamp>'+msg.timestamp
				+'</span> <span class=user>'+msg.user+'</span>@<span class=remote_addr>'
				+msg.remote_addr+'</span>: <span class=message>'+msg.message+'</span></div>';
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
