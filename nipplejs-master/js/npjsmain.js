var options = {
    position: {       // preset position for 'static' mode
      top: '40%',
      left: '50%'
    },
    mode: "static",   // 'dynamic', 'static' or 'semi'
    color: "green"
};

var dis=0;
var ang=0;
var fsc=2/90;

var manager = nipplejs.create(options);

manager.on('move dir start end', function (evt, data) {
  console.log(evt, data);
  console.log(evt.type);
  console.log(evt);
	if (data.direction){
		output = "<p>x direction: " +data.direction.x+ "</br>y direction: " +data.direction.y+ "</br>angle: "+data.direction.angle+"</br>distance: "+data.distance+"</br> angle deg: "
		+data.angle.degree+"</br> angle rad: "+data.angle.radian+"</br> f: "+fsc+"</p>";
		console.log(output);
		document.getElementById('console').innerHTML = output;
		console.log(data.direction.x);
		dis = data.distance;
		localStorage.setItem("dis",dis);
		localStorage.setItem("ang",ang);
		localStorage.setItem("fsc",fsc);
	}
});
