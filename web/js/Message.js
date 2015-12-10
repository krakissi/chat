/*
	Send and receive messages.
*/
var Message = {
	name: "Message",
	chatbody: undefined,
	message: undefined,
	post_status: undefined,
	waslocked: true,
	id_last: -1,

	truncatelength: 30000,
	truncatemode: undefined,

	first: true,

	send: function(){
		var om = this.message.value;
		this.message.value = "";
		this.lastsent = om;

		var post = encodeURIComponent(om);

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
					else if(xhr.status == 413)
						pstate = 3;
					else if(xhr.status == 400)
						pstate = 4;
					else if((xhr.status >= 500) && (xhr.status < 600))
						pstate = -1;
				} else pstate = 1;

				Message.posting_status(pstate);

				// Restore old value on a failure, if there's no current value.
				if(((pstate == 3) || (pstate == -1)) && (Message.message.value.length == 0))
					Message.message.value = this.om;
			},

			// Original message for restoration
			om: om
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
		case 3:
			Message.post_status.style.display = "inline";
			Message.post_status.innerHTML = '<span style="color: red;">Message too long.</span>';
			Message.post_status_to = setTimeout('Message.posting_status(0)', 5000);
			break;
		case 4:
			Message.post_status.style.display = "inline";
			Message.post_status.innerHTML = '<span style="color: red;">Message too short.</span>';
			Message.post_status_to = setTimeout('Message.posting_status(0)', 5000);
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
			if(h < 10)
				h = '0' + h;
			ap = "pm";
		}
		if(!h || (h == "00"))
			h = 12;

		return h + ':' + m + ':' + s + ' ' + ap;
	},

	batch_clear: function(){
		this.batchset = '';
	},

	batch_commit: function(){
		if(this.first){
			this.chatbody.innerHTML = "";
			this.first = false;
		}

		this.chatbody.innerHTML += this.batchset;
		this.batch_clear();

		this.chatbody.scrollTop = this.chatbody.scrollHeight;

	},

	// Write a received message out to the chatbody div.
	receive: function(msg, batch){
		var locked = false;

		if(Message.chatbody.scrollTop > (Message.chatbody.scrollHeight - Message.chatbody.offsetHeight - 20))
			locked = true;

		// Do not load out of order (probably duplicate) messages.
		if(msg.message && (parseInt(msg.id_message) > Message.id_last)){
			Message.id_last = msg.id_message;

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

			var username = msg.user;
			var username_title = '';
			if(userinfo.pretty){
				username = userinfo.pretty;
				username_title = ' title="' + msg.user + '"';
			}

			var emote = msg.message.match(/^\/me/);

			var formatted = (emote) ?
				'<div><span class=timestamp><span class=date>'
					+ tsdate + '&nbsp;</span><span class=time>' + tstime + '</span>'
					+ '</span> <span' + username_title + ' class="user' + (userhighlight ? ' ' + userhighlight : '')
					+ '" username="' + msg.user + '">' + username
					+ '</span> <span class="message emote' + (msg.iphighlight ? ' ' + msg.iphighlight : '')
					+ '" style="color: ' + msg.ipcolor + ';">'
					+ msg.message.substr(3) + '</span></div>' :
				'<div><span class=timestamp><span class=date>'
					+ tsdate + '&nbsp;</span><span class=time>' + tstime + '</span>'
					+ '</span> <span class="user_brackets' + (msg.iphighlight ? ' ' + msg.iphighlight : '')
					+ '" style="color: ' + msg.ipcolor
					+ ';">[<span' + username_title + ' class="user' + (userhighlight ? ' ' + userhighlight : '')
					+ '" username="' + msg.user + '">' + username
					+ '</span>]</span> <span class=message>'
					+ msg.message + '</span></div>';

			if(msg.message.match(new RegExp("<span class=hashtag>@" + Core.user, 'i')) || msg.message.match(new RegExp("<span class=hashtag>@cq")))
				Message.mention = true;

			if(batch)
				this.batchset += formatted;
			else this.chatbody.innerHTML += formatted;
		}

		if(locked)
			this.scrollbottom();

		this.waslocked = locked;
	},

	scrollbottom: function(){
		Message.chatbody.scrollTop = Message.chatbody.scrollHeight;
	},

	// Handle received keyboard input.
	keyhandler: function(event){
		var key = event.keyCode || event.which;

		switch(key){
			case 38: // Up Arrow
				if(Message.lastsent && Message.message.value === "")
					Message.message.value = Message.lastsent;
				break;

			case 40: // Down Arrow
				if(Message.lastsent && (Message.message.value === Message.lastsent))
					Message.message.value = "";
				break;

			case 13: // Return
				if(!event.shiftKey){
					switch(event.type){
						case "keypress":
							Message.send();
							break;
						case "keyup":
							var s = Message.message.value;

							if(s.length)
								s = s.slice(0, -1);
							Message.message.value = s;
							break;
					}
				}
				break;
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

		document.addEventListener(Core.resizeevent.eventName, this.scrollbottom);
	}
};

if(Core)
	Core.add(Message);
