/*
	Send messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,
	message: undefined,

	send: function(){
		var post = "message="+encodeURIComponent(this.message.value);
		this.message.value = "";

		Ajax.get({
			method:'POST',
			target:'bin/post.cgi',
			post:post
		});

		return true;
	},

	// Write a received message out to the chatbody div.
	receive: function(msg){
		if(msg.message){
			msg.message = decodeURIComponent(msg.message);
			this.chatbody.innerHTML +='<div><span class=timestamp>'+msg.timestamp
				+'</span> <span class=user>'+msg.user+'</span>@<span class=remote_addr>'
				+msg.remote_addr+'</span>: <span class=message>'+msg.message+'</span></div>';
		}
	},

	init: function(){
		this.chatbody = document.getElementById('chatbody');
		this.message = document.getElementById('message');
	}
};

Core.add(Message);
