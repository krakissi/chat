/*
	Send and receive messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,
	message: undefined,
	post_status: undefined,
	waslocked: true,

	truncatelength: 30000,
	truncatemode: undefined,

	send: function(){
		var post = encodeURIComponent(this.message.value);

		if(post == "")
			return false;

		post = "message=" + post;

		Ajax.get({
			method: 'POST',
			target: 'bin/post.cgi',
			post: post,
			onreadystatechange: function(xhr){
				var pstate = 0;

				if(xhr.readyState === 4){
					if(xhr.status === 204)
						pstate = 2;
				} else pstate = 1;

				Message.posting_status(pstate);
			}
		});

		if(Chat.sleeping)
			Chat.sleeptoggle(false);

		return true;
	},

	// A gremlin from kc1.
	posting_status: function(state){
		clearTimeout(Message.post_status_to);
		switch(state){
		case 1:
			Message.post_status.style.display = "inline";
			Message.post_status.innerHTML = '<span style="color: yellow;">Posting...</span>';
			break;
		case 2:
			Message.post_status.style.display = "inline";
			Message.post_status.innerHTML = '<span style="color: green;">OK</span>';
			Message.post_status_to = setTimeout('Message.posting_status(0)', 1500);
			break;
		case -1:
			Message.post_status.style.display = "inline";
			Message.post_status.innerHTML = '<span style="color: red;">Failed</span>';
			Message.post_status_to = setTimeout('Message.posting_status(0)', 5000);
			break;
		default:
			Message.post_status.style.display = "none";
			Message.post_status.innerHTML = "";
		}
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
		if(!h || (h == "00"))
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
			var tstime = this.time24to12(tsparts[1]);

			var userinfo = Chat.last.userlist[msg.user];
			var usercolor = undefined;
			var userhighlight = undefined;
			if(userinfo){
				usercolor = userinfo.color;
				userhighlight = userinfo.highlight;
			}
			if(!usercolor)
				usercolor = 'white';

			this.chatbody.innerHTML += '<div><span class=timestamp><span class=date>'
				+ tsdate + '&nbsp;</span><span class=time>' + tstime + '</span>'
				+ '</span> <span class=user_brackets style="color: ' + msg.ipcolor
				+ ';">[<span class="user' + (userhighlight ? ' ' + userhighlight : '' )
				+ '" style="color: ' + usercolor + ';">' + msg.user
				+ '</span>]</span> <span class=message>'
				+ msg.message + '</span></div>';
		}

		if(locked)
			Message.chatbody.scrollTop = Message.chatbody.scrollHeight;

		this.waslocked = locked;
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

	// Enable/disable truncate mode.
	truncate: function(){
		if(Message.truncatemode = Message.truncate_toggle.checked)
			if(Message.chatbody.innerHTML.length > Message.truncatelength)
				Message.chatbody.innerHTML = Message.chatbody.innerHTML.substr(Message.chatbody.innerHTML.length - Message.truncatelength + 1);

		localStorage.setItem("Message.truncate", Message.truncatemode);
	},

	init: function(){
		this.chatbody = document.getElementById('chatbody');
		this.message = document.getElementById('message');
		this.post_status = document.getElementById('post_status');
		this.truncate_toggle = document.getElementById('truncate_toggle');

		this.message.onkeypress = this.keyhandler;
		this.message.onkeyup = this.keyhandler;
		this.message.focus();

		var ls_truncate = localStorage.getItem("Message.truncate");
		this.truncate_toggle.checked = (ls_truncate && (ls_truncate == "true"));
		document.addEventListener(Chat.newmessage.eventName, this.truncate);
		truncate_toggle.addEventListener("change", this.truncate);
		this.truncate();
	}
};

if(Core)
	Core.add(Message);
