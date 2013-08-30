sh.directive('currentTime', function () {
	return {
		restrict: 'E',
		replace: false,
		controller: function ($scope, $element) {
			$scope.time = new Date()
			$scope.num = null

			var interval = setInterval(tick, 10000)

			function tick() {
				$scope.time = new Date();
				$scope.$apply()
			}

			function resetInterval() {
				clearInterval(interval);
			}

			$element.bind('$destroy', function () {
                resetInterval();
            });
		}
	}
})