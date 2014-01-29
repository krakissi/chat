/*
	Allows processing of asynchronous requests.
*/

var Ajax = {
	name: "Ajax",

	method: undefined,
	target: undefined,
	
	get: function(meta){
		if(!meta)
			return false;

		var http = new XMLHttpRequest();
		this.method = (meta.method)?meta.method:"GET";
		this.target = meta.target;

		http.onreadystatechange = (meta.onreadystatechange)?meta.onreadystatechange:function(){
			if(http.readyState==4){
				switch(http.status){
					case 200:
						if(meta.success)
							meta.success(http);
						break;
					default:
						if(meta.unhandled)
							meta.unhandled(http);
				}
			}
		}

		var post = (meta.method=="POST")?meta.post:undefined;
		http.open(this.method, this.target, true);
		http.send(post);
	},
};

Core.add(Ajax);
