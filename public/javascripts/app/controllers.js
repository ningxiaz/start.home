sh.controller('MainCtrl', ['$scope', function($scope) {
    $scope.moment = moment;
}]);

sh.controller('PresentCtrl', ['$scope', 'angularFire', function($scope, angularFire) {
	var fb = new Firebase('https://start-home.firebaseio.com')
	angularFire(fb.child('climate'), $scope, 'climate')

}]);

sh.controller('FutureCtrl', ['$scope', 'angularFireCollection', 'angularFire', function($scope, angularFireCollection, angularFire) {
	var fb = new Firebase('https://start-home.firebaseio.com')

	var future = fb.child('future')
	angularFire(fb.child('snapshots/all').limit(200), $scope, 'snapshots')
	future.once('value', linkFutureView)

	// initialize the future view
	var view = futureView();
	var vis = view.init(goalFunc);

	function goalFunc(goals) {
		$scope.present.goals = goals;
		$scope.$apply()
	}

	$scope.equals = angular.equals;

	$scope.projection = {
		electric: 0,
		water: 0
	}

	$scope.toggleCommitment = function(commitment) {
		commitment.selected = !commitment.selected;
	}

	$scope.saveGoals = function() {
		$scope.old_present = angular.copy($scope.present)
		future.set(angular.copy($scope.present))
	}

	$scope.resetGoals = function() {
		$scope.present = angular.copy($scope.old_present)
		vis.goal($scope.present.goals, true)
	}

	function linkFutureView(snapshot) {
		$scope.present = snapshot.val()
		$scope.old_present = snapshot.val()

		$scope.$watch('[present.commitments.electric, present.commitments.water, present.temperature, snapshots]', function (newVal) {
			if ($scope.snapshots) {
				$scope.projection['electric'] = d3.mean(d3.values($scope.snapshots), function(d) {
					return d.electric.total;
				})

				$scope.projection['water'] = d3.mean(d3.values($scope.snapshots), function(d) {
					return d.water.total;
				})
			}

			$scope.projection['electric'] += d3.values(newVal[0]).filter(function(d) {
				return d.selected;
			}).reduce(function(prev, curr) {
				return prev + curr.impact;
			}, 0)

			// factor in the HVAC estimate
			// $scope.projection['electric'] += parseInt(newVal[2]) * (0.2);

			$scope.projection['water'] += d3.values(newVal[1]).filter(function(d) {
				return d.selected;
			}).reduce(function(prev, curr) {
				return prev + curr.impact;
			}, 0)

			console.log($scope.projection)

			vis.projection($scope.projection, true)

		}, true);

		vis.goal($scope.present.goals, true)
	}

	$scope.round = function(num) {
		return Math.round(num * 100) / 100;
	}
}]);