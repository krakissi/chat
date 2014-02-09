/*
	Send messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,

	body: undefined,
	send: function(msg){
		this.body.message=msg;

		alert(this.body.message);
		return true;
	},

	// Write a received message out to the chatbody div.
	receive: function(msg){
		if(msg.message){
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
	}
};

Core.add(Message);
