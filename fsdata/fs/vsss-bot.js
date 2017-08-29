function writeFloatAt(buff, pos, val) {
	var f_tmp = new Float32Array(1);
	f_tmp[0] = val;
	
	var b_tmp = new Uint8Array(f_tmp.buffer);
	buff.set(b_tmp, pos);
}

var myApp = angular.module('myApp', []);
myApp.controller("vsssBotController", function($scope) {
	console.log("AngularJS scope initializing...");
	
	$scope.speedCaptions = [
		"-100%", "-90%", "-80%", "-70%", "-60%", "-50%", "-40%", "-30%", "-20%", "-10%", "0%", "+10%", "+20%", "+30%", "+40%", "+50%", "+60%", "+70%", "+80%", "+90%", "+100%"
	];
	$scope.speedValues = [
		-1.0, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, 0, +0.1, +0.2, +0.3, +0.4, +0.5, +0.6, +0.7, +0.8, +0.9, +1.0
	];
	
	$scope.left_vel_rng = 10;
	$scope.right_vel_rng = 10;
	
	$scope.onSpeedChange = function() {
		if (!$scope.online)
			return;
		
		var payload = {
			leftVel:  $scope.speedValues[$scope.left_vel_rng],
			rightVel: $scope.speedValues[$scope.right_vel_rng]
		};
		var buff = $scope.Robot_Command.encodeDelimited(payload).finish();
		
		console.log(payload, buff);
		
		$scope.ws.send(buff);
	};

	//CUSTOM VARIABLES//
	$scope.info = info;
	$scope.v1 = 0;
	$scope.v2 = 0;
	$scope.x  = 0;
	$scope.y  = 0;
	$scope.sX = 0;
	$scope.sY = 0;
	$scope.speed = 0;
	$scope.lvel = 0;
	$scope.rvel = 0;
	$scope.checked = false;

	//CUSTOM FUNCTIONS//
	$scope.doubleSpeedChange = function() {
		var x = $scope.double_vel_rng;
		
		$scope.left_vel_rng = x;
		$scope.right_vel_rng = x;
		$scope.onSpeedChange();
	};

	$scope.reset = function() {
		var x = $scope.checked
		if (x === true) {
			$scope.left_vel_rng = 10;
			$scope.right_vel_rng = 10;
			$scope.onSpeedChange();
		}	
	};

	$scope.ahead  = function() {
		$scope.left_vel_rng = 14 + $scope.speed;
		$scope.right_vel_rng = 14 + $scope.speed;
		$scope.onSpeedChange();
	};
	
	$scope.retreat   = function() {
		$scope.left_vel_rng = 6 - $scope.speed;
		$scope.right_vel_rng = 6 - $scope.speed;
		$scope.onSpeedChange();
	};	

	$scope.turnRight  = function() {
		$scope.left_vel_rng = 8 - $scope.speed;
		$scope.right_vel_rng = 14 + $scope.speed;
		$scope.onSpeedChange();
	};	
	
	$scope.turnLeft  = function() {
		$scope.left_vel_rng = 14 + $scope.speed;
		$scope.right_vel_rng = 8 - $scope.speed;
		$scope.onSpeedChange();
	};

	$scope.spdbar  = function(value) {
		var x = value;
		if (x >= 96 && x<= 102) {
			$scope.speed = x - 96;
			document.getElementById("speed").value = x - 96;
		}
	};

	$scope.slockSwitch = function() {
		var x = $scope.checked
		if (x === false) {
			$scope.checked = true;
			console.log('SPEEDLOCK ON');
		}
		else {
			$scope.checked = false;
			$scope.reset();
			console.log('SPEEDLOCK OFF');
		}
	};	
	
	$scope.convertVel = function() {
		var r     = $scope.info[0];
		var th    = $scope.info[1];
		var f     = $scope.info[2];
		var trad  = $scope.info[3];
		$scope.x  = r*Math.cos(trad);
		$scope.y  = r*Math.sin(trad);
		$scope.sX = $scope.x/Math.abs($scope.x);
		$scope.sY = $scope.y/Math.abs($scope.y);
		$scope.v1 = (Math.floor(r/5))/10;
		while (th>90){
			th=th-90;
		}
		$scope.v2 = (Math.floor(r*((f*th)-1)/5))/10;
	};

	$scope.inputVel = function() {
		if($scope.x==0 && $scope.y==0) {
			$scope.lvel = 0;
			$scope.rvel = 0;
		}
		else if($scope.sX*$scope.sY>=0) {
			$scope.lvel = ($scope.sX)*$scope.v1;
			$scope.rvel = ($scope.sY)*$scope.v2;
		}
		else if($scope.sX*$scope.sY<=0) {
			$scope.lvel = ($scope.sX)*$scope.v2;
			$scope.rvel = ($scope.sY)*$scope.v1;
		}
		$scope.left_vel_rng = (10+(10*$scope.lvel));
		$scope.right_vel_rng = (10+(10*$scope.rvel));
		$scope.onSpeedChange();	
	};
	
	//Connection Checking
	$scope.online = false;
	$scope.updateOnlineStatus = function() {
		$scope.online = 
			$scope.Robot_Command &&
			$scope.ws.readyState == WebSocket.OPEN;
	}
	
	// Start a websocket
	$scope.ws = new WebSocket("ws://" + location.host + "/ws");
	$scope.ws.binaryType = 'arraybuffer';

	$scope.ws.onopen = function () {
		console.log("WebSocket: Connection open.");
		$scope.updateOnlineStatus();
		$scope.$apply();
		
		// ESP's HTTPD might kill our socket if it stays inactive.
		// Work around by sending PING packets every 5 seconds.
		window.setInterval(function() {
			console.log("Ping?");
			$scope.ws.send("PING");
			$scope.ping_req = Date.now();
			$scope.$apply();
		}, 1000);
	};

	$scope.ws.onmessage = function (e) {
		console.log("WebSocket: Connection data: " + e.data);
		
		if (e.data == "PONG!") {
			$scope.ping = Date.now() - $scope.ping_req;
		}
		
		$scope.$apply();
	};

	$scope.ws.onerror = function (e) {
		console.log("WebSocket: Connection failed.");
		$scope.updateOnlineStatus();
		$scope.$apply();
	};
	
	// Load  protobuf message types
	protobuf.load("vsss-pb/command.proto", function(err, root) {
		if (err) {
			console.log("Failed to load vsss-pb/command.proto.", err);
			return;
		}
		console.log("Protobuf message formats loaded.");
		
		$scope.Robot_Command = root.lookupType("vss_command.Robot_Command");
		
		$scope.updateOnlineStatus();
		$scope.$apply();
	});
	
	console.log("AngularJS scope initialized.");
});
