/*
	Send messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,
	messageform: undefined,

	body: undefined,
	send: function(){
		this.messageform.submit();

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
		this.body = {
			message: undefined
		}

		this.chatbody = document.getElementById('chatbody');
		this.messageform = document.forms["messageform"];
	}
};

Core.add(Message);
