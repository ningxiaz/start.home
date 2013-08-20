var sh = angular.module('sh', ['firebase']);

sh.controller('GoalViewCtrl', ['$scope', 'angularFire', 
	function GoalViewCtrl($scope, angularFire) {
		var url = 'https://start-home.firebaseio.com/goals/';
		var promise = angularFire(url, $scope, 'goals', {});

		$scope.temperature = 28;

		$scope.scale = d3.scale.linear().range(['#1E91B8', '#D45D5D']).domain([50,80])

		promise.then(function() {
			$scope.getCommitmentSum = function(type) {
				var b = $scope.goals.commitments.suggestions;
				var sum = b.reduce(function(prev, cur) {
					if (cur && cur.accepted && cur.type == type) return prev + cur.impact;
					return prev;
				}, 0);

				return sum;
			}
		})
	}
])


sh.controller('NotificationCtrl', ['$scope', 'angularFire', 
	function NotificationCtrl($scope, angularFire) {
		var url = 'https://start-home.firebaseio.com/notifications/';
		var promise = angularFire(url, $scope, 'notifications', []);
	}
])