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
		count: 50,
		wind: 1
	},
	snowing: true,
	interval: undefined,
	drawflag: false,

	// Flip display and draw canvases.
	flip: function(){
		var active;

		if(this.drawflag){
			document.getElementById('snowscape').style['z-index'] = -2;

			active = document.getElementById('snowscape2');
			active.style['z-index'] = -1;
		} else {
			document.getElementById('snowscape2').style['z-index'] = -2;

			active = document.getElementById('snowscape');
			active.style['z-index'] = -1;
		}

		this.context = active.getContext('2d');
		this.drawflag = !this.drawflag;
		return active;
	},

	// Get the currently active draw surface
	get_frame: function(getBgInstead){
		var flag = (getBgInstead ? !this.drawflag : this.drawflag);

		return document.getElementById(flag ? 'snowscape2' : 'snowscape');
	},

	// Toggle snowfall visibility and animation.
	toggle: function(){
		var snowscape = KrakSnow.get_frame(false);
		var snowscape2 = KrakSnow.get_frame(true);

		if(KrakSnow.snowing){
			KrakSnow.snowing = false;
			snowscape.style.display = snowscape2.style.display = 'none';
			clearInterval(KrakSnow.interval);
		} else {
			KrakSnow.snowing = true;
			snowscape.style.display = snowscape2.style.display = 'block';
			KrakSnow.flake_update();
		}
	},

	init: function(scene){
		if(scene)
			for(var k in scene)
				this.scene[k] = scene[k];

		var snowscape = this.get_frame();
		snowscape.width = KrakSnow.scene.w = document.documentElement.clientWidth;
		snowscape.height = KrakSnow.scene.h = document.documentElement.clientHeight;

		this.context = snowscape.getContext('2d');
		this.snowing = true;

		for(var i = 0; i < this.scene.count; i++)
			this.flake_make(true);

		KrakSnow.flake_update();

		document.addEventListener(Core.resizeevent.eventName, this.resize);
	},

	// Adjust the canvas, based on the size of the window
	resize: function(){
		// Resize foreground
		var snowscape = KrakSnow.get_frame();
		snowscape.width = KrakSnow.scene.w = document.documentElement.clientWidth;
		snowscape.height = KrakSnow.scene.h = document.documentElement.clientHeight;

		// Resize background
		snowscape = KrakSnow.get_frame(true);
		snowscape.width = KrakSnow.scene.w;
		snowscape.height = KrakSnow.scene.h;
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

		if(this.interval)
			clearTimeout(this.interval);

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

		//ctx.clearRect(0, 0, this.scene.w, this.scene.h);
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this.scene.w, this.scene.h);

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

		this.interval = setTimeout(function(){
			KrakSnow.flake_update();
			KrakSnow.flip();
		}, 1000 / 45);
	},
};

if(Core)
	Core.add(KrakSnow);
