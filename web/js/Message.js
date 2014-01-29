/*
	Send messages.
*/
var Message = {
	name: "Message",
	send: function(msg){
		this.body.message=msg;

		alert(this.body.message);
		return true;
	},
	body: {
		message: undefined,
	},
};

Core.add(Message);
