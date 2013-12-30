app.controller('userDetailCtrl', function ($scope, $location) {
    var userLQ = $scope.MR.user.liveQuery;
    var voteLQ = $scope.MR.novelVote.liveQuery;
    var novelLQ = $scope.MR.novel.liveQuery;



	if ($location.search().username) {
        $scope.aUserLQ = userLQ().findOne().where('fb.username').equals($location.search().username).exec();

	}
    $scope.aUserLQ.promise.then(function (LQ) {
        console.log(LQ);
        var userId = LQ.doc._id;

        $scope.votesLQ = voteLQ().where('owner').equals(userId).populate('subject', 'title').exec();
        $scope.novelsLQ = novelLQ().where('owner').equals(userId).exec();

        $scope.voteCountLQ = voteLQ().find({owner: userId}).count().exec();
        $scope.positiveVoteCountLQ = voteLQ().find({owner: userId, value: true}).count().exec();
        $scope.negativeVoteCountLQ = voteLQ().find({owner: userId, value: false}).count().exec();

    });


    $scope.$watch('findByName', function (nV, oV) {
		if (nV) {
			$location.search('username', nV);
//			$scope.LQ._query.equals = nV;
		}

    });

	$scope.deleteCurrentQuery = function () {
        $scope.aUserLQ.stop();
		delete $scope.aUserLQ;
		delete $scope.votesLQ;
		delete $scope.novelsLQ;
	};





});