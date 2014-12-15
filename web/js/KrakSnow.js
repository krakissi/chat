var KrakSnow = {
	name: 'KrakSnow',

	// An array of all the snowflakes on screen.
	flakes: [],
	context: undefined,
	scene: {
		w: 1920,
		h: 1080,
		minSpeed: 2,
		maxSpeed: 4,
		sway: 50,
		size: 4,
		count: 70
	},
	snowing: true,
	interval: undefined,

	toggle: function(){
		var snowscape = document.getElementById('snowscape');

		if(KrakSnow.snowing){
			KrakSnow.snowing = false;
			snowscape.style.display = 'none';
			clearInterval(KrakSnow.interval);
		} else {
			KrakSnow.snowing = true;
			snowscape.style.display = 'block';
			KrakSnow.interval = setInterval(function(){
				KrakSnow.flake_update();
			}, 1000 / 60);
		}
	},

	init: function(scene){
		if(scene)
			for(var k in scene)
				this.scene[k] = scene[k];

		var snowscape = document.getElementById('snowscape');
		snowscape.width = KrakSnow.scene.w = document.documentElement.clientWidth;
		snowscape.height = KrakSnow.scene.h = document.documentElement.clientHeight;

		this.context = snowscape.getContext('2d');
		this.snowing = true;

		for(var i = 0; i < this.scene.count; i++)
			this.flake_make(true);

		this.interval = setInterval(function(){
			KrakSnow.flake_update();
		}, 1000 / 60);

		document.addEventListener(Core.resizeevent.eventName, this.resize);
	},

	// Adjust the canvas, based on the size of the window
	resize: function(){
		var snowscape = document.getElementById('snowscape');
		
		snowscape.width = KrakSnow.scene.w = document.documentElement.clientWidth;
		snowscape.height = KrakSnow.scene.h = document.documentElement.clientHeight;
	},

	// Produce a new random snow flake
	flake_make: function(randomY){
		this.flakes.push({
			cx: Math.random() * this.scene.w,
			cy: randomY ? (Math.random() * this.scene.h) : 0,
			r: Math.random() * this.scene.size,
			speed: Math.random() * (this.scene.maxSpeed - this.scene.minSpeed) + this.scene.minSpeed,
			offset: Math.random() * 2 * Math.PI,
			amplitude: Math.random() * this.scene.sway
		});
	},

	// Erase the old flake position, adjust the parameters of the flake, and draw again.
	flake_update: function(){
		var ctx = this.context;
		var flakes = this.flakes;
		var swayFactor = this.scene.sway;
		var height = this.scene.h;

		if(!flakes)
			flakes = [];

		var sway = function(flake){
			var x = flake.cx;

			x += Math.sin(flake.offset + flake.cy / 100) * flake.amplitude;

			return x;
		};

		var rm = [];
		ctx.clearRect(0, 0, this.scene.w, this.scene.h);
		flakes.forEach(function(flake, index){
			// fall
			flake.cy += flake.speed;
			cx = sway(flake);

			if(flake.cy > (height + flake.r * 2))
				rm.push(index);
			else {
				// draw
				ctx.beginPath();
				ctx.arc(cx, flake.cy, flake.r, 0, 2 * Math.PI);
				ctx.fillStyle = '#ffffff';
				ctx.fill();
			}
		});

		// Remove each expired flake.
		var rmcount = rm.length;
		rm.forEach(function(index){
			flakes.splice(index, 1);
		});

		if(rmcount)
			while(rmcount--)
				this.flake_make();

		this.flakes = flakes;
	},
};

if(Core)
	Core.add(KrakSnow);
