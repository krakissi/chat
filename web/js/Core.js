/*
	Meta module which ties everything together. Manages user
	identity and initialization for modules.

	Modules should register with this by calling Core.add().
*/
var Core = {
	user: undefined,
	modules: undefined,
	initcomplete: undefined,
	focusevent: undefined,
	resizeevent: undefined,

	focus: function(){
		document.dispatchEvent(Core.focusevent);
	},

	// Should be called body onload.
	init: function(){
		this.initcomplete = document.createEvent("HTMLEvents");
		this.initcomplete.initEvent("initcomplete", true, true);
		this.initcomplete.eventName = "initcomplete";

		this.focusevent = document.createEvent("HTMLEvents");
		this.focusevent.initEvent("focusevent", true, true);
		this.focusevent.eventName = "focusevent";

		this.resizeevent = document.createEvent("HTMLEvents");
		this.resizeevent.initEvent("resizeevent", true, true);
		this.resizeevent.eventName = "resizeevent";

		window.onresize = function(){
			document.dispatchEvent(Core.resizeevent);
		};

		this.modules.forEach(function(mod){
			if(mod.init)
				mod.init();
		});

		document.dispatchEvent(this.initcomplete);
		document.body.onfocus = this.focus;
	},

	// Register objects with Core.
	add: function(reference){
		if(this.modules === undefined)
			this.modules = new Array();

		this.modules.push(reference);
	},
};
