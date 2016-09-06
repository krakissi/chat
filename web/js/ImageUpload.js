var ImageUpload = {
	name: 'ImageUpload',

	picker_show: function(){
		var me = this;

		if(me.picker_el)
			me.picker_el.style.display = 'inline';
	},

	init: function(){
		var me = this;

		me.picker_el = document.getElementById('image_picker');
		me.picker = document.createElement('div');

		// Create file input field.
		me.picker_field = document.createElement('input');
		me.picker_field.setAttribute('type', 'file');
		me.picker.appendChild(me.picker_field);
		me.picker.appendChild(document.createElement('br'));

		// Create preview element.
		me.image = document.createElement('img');
		me.image.style.maxHeight = '200px';
		me.picker.appendChild(me.image);

		me.picker_el.appendChild(me.picker);

		me.submitterdiv = document.createElement('div');
		me.submitterdiv.setAttribute('class', 'submitterdiv');

		// Create preview button.
		me.previewbtn = document.createElement('button');
		me.previewbtn.innerHTML = 'Preview';
		me.submitterdiv.appendChild(me.previewbtn);

		me.picker_el.appendChild(me.submitterdiv);

		me.previewbtn.addEventListener('click', function(){
			var rdr = new FileReader();

			rdr.addEventListener('load', function(){
				me.image.src = rdr.result;
			});

			rdr.readAsDataURL(me.picker_field.files[0]);
		});
	}
};

if(Core)
	Core.add(ImageUpload);
