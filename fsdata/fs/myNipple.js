var options = {
    position: {       // preset position for 'static' mode
      top: '50%',
      left: '45%'
    },
    mode: "static",   // 'dynamic', 'static' or 'semi'
    color: "green"
};

var info = [0,0,0,0];

var manager = nipplejs.create(options);

manager.on('move dir start end', function (evt, data) {
  console.log(evt, data);
  console.log(evt.type);
  console.log(evt);
	if (data.direction){
		output = "<p>x direction: " +data.direction.x+ "</br>y direction: " +data.direction.y+ "</br>angle: "+data.direction.angle+"</br>distance: "+data.distance+"</br> angle deg: "
		+data.angle.degree+"</br> angle rad: "+data.angle.radian+"</br> f: "+2/90+"</p>";
		console.log(output);
		info[0] = data.distance;
		info[1] = data.angle.degree;
		info[2] = 2/90;
		info[3] = data.angle.radian;
		console.log(info);
		angular.element($("#vsssBotController")).scope().$apply();
		angular.element($("#vsssBotController")).scope().info = info;
		angular.element($("#vsssBotController")).scope().speed = Math.floor(angular.element($("#vsssBotController")).scope().info[0])
		angular.element($("#vsssBotController")).scope().convertVel();
		angular.element($("#vsssBotController")).scope().inputVel();
		angular.element($("#vsssBotController")).scope().$apply();
	};
	localStorage.setItem("info",info);
	if(evt.type == "end"){
		angular.element($("#vsssBotController")).scope().info = [0,0,0,0];
		angular.element($("#vsssBotController")).scope().convertVel();
		angular.element($("#vsssBotController")).scope().sX = 0;
		angular.element($("#vsssBotController")).scope().sY = 0;
		angular.element($("#vsssBotController")).scope().speed = 0;
		angular.element($("#vsssBotController")).scope().inputVel();
		angular.element($("#vsssBotController")).scope().reset();
		angular.element($("#vsssBotController")).scope().$apply();
	}
});
