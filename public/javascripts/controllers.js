var sh = angular.module('sh', ['firebase']);

sh.controller('GoalCtrl', ['$scope', 'angularFire', 
	function GoalCtrl($scope, angularFire) {
		var url = 'https://start-home.firebaseio.com/goals/';
		var promise = angularFire(url, $scope, 'goals', {});

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