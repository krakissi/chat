/*
	Meta module which ties everything together. Manages user
	identity and initialization for modules.

	Modules should register with this by calling Core.add().
*/
var Core = {
	user: undefined,
	modules: undefined,
	initcomplete: undefined,

	// Should be called body onload.
	init: function(){
		this.initcomplete = document.createEvent("HTMLEvents");
		this.initcomplete.initEvent("initcomplete", true, true);
		this.initcomplete.eventName = "initcomplete";

		this.modules.forEach(function(mod){
			if(mod.init)
				mod.init();
		});

		document.dispatchEvent(this.initcomplete);
	},

	// Register objects with Core.
	add: function(reference){
		if(this.modules === undefined)
			this.modules = new Array();

		this.modules.push(reference);
	},
};
