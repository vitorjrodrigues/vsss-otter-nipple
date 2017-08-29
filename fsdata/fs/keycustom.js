$(document).keydown(function(e) {
  if(e.which === 37 || e.which === 65 || e.which === 74) {
	angular.element($('#vsssBotController')).scope().turnLeft();
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('LEFT (key number '+e.which+')');
  }
  else if(e.which === 38 || e.which === 87|| e.which === 73) {
	angular.element($('#vsssBotController')).scope().ahead();
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('UP (key number '+e.which+')');
  }
  else if(e.which === 39 || e.which === 68|| e.which === 76) {
	angular.element($('#vsssBotController')).scope().turnRight();
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('RIGHT (key number '+e.which+')');
  }
  else if(e.which === 40 || e.which === 83|| e.which === 75) {
	angular.element($('#vsssBotController')).scope().retreat();
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('DOWN (key number '+e.which+')');
  }
  else if(e.which === 96 || e.which === 97 || e.which === 98 || e.which === 99 || e.which === 100 || e.which === 101 || e.which === 102) {
	angular.element($('#vsssBotController')).scope().spdbar(e.which);
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('Speed at '+((e.which-92)*10)+'%');
  }
  else if(e.which === 32) {
	angular.element($('#vsssBotController')).scope().reset();
	angular.element($('#vsssBotController')).scope().$apply();
	console.log('STOP');
  }
  else if(e.which === 16) {
	angular.element($('#vsssBotController')).scope().slockSwitch();
	angular.element($('#vsssBotController')).scope().$apply();
  }
});

 $(document).keyup(function(e) {
  if(e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40 || e.which === 65 || e.which === 68 
  || e.which === 73 || e.which === 74 || e.which === 75 || e.which === 76 || e.which === 83 || e.which === 87) {
	angular.element($('#vsssBotController')).scope().reset();
	angular.element($('#vsssBotController')).scope().$apply();
  }
});
