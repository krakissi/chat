var KrakSnow = {
	name: 'KrakSnow',

	// An array of all the snowflakes on screen.
	flakes: [],
	context: undefined,
	scene: {
		w: 1920,
		h: 1080,
		minSpeed: 2,
		maxSpeed: 5,
		sway: 50,
		size: 4,
		count: 35,
		wind: 1
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
			}, 1000 / 30);
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
		}, 1000 / 30);

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
			cy: randomY ? (Math.random() * this.scene.h) : -this.scene.size,
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
		var width = this.scene.w;
		var wind = this.scene.wind;

		if(!flakes)
			flakes = [];

		var sway = function(flake){
			var x = flake.cx;

			x += Math.sin(flake.offset + flake.cy / 100) * flake.amplitude;
			if(x > width)
				x -= width;
			else if(x < 0)
				x += width;

			return x;
		};

		ctx.clearRect(0, 0, this.scene.w, this.scene.h);

		var rmcount = 0;
		flakes.forEach(function(flake, index, array){
			// fall
			flake.cy += flake.speed;
			flake.cx += Math.random() * wind;

			if(flake.cy > (height + flake.r * 2)){
				rmcount++;
				array.splice(index, 1);
			} else {
				// draw
				ctx.beginPath();
				ctx.arc(sway(flake), flake.cy, flake.r, 0, 2 * Math.PI);
				ctx.fillStyle = '#ffffff';
				ctx.fill();
			}
		});

		if(rmcount)
			while(rmcount--)
				this.flake_make();

		this.flakes = flakes;
	},
};

if(Core)
	Core.add(KrakSnow);
