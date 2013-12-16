//expects this kind of query:
//  liveQuery().populate('subject', 'title').populate('owner', 'fb.username fb.picture.data.url').exec();

angular.module('zakonomat').directive('znVote', function (MRBackend, userService) {
	return {
		replace: false,
		restrict: 'E',
		templateUrl: '/templates/directives/zn_vote.html',
		scope: {
			vote: '='
		},
		link: function (scope, el, attr) {
			MRBackend.getModel('novelVote').then(function (voteModel) {
				scope.ready = true;
                var userId = userService.profile._id;
                scope.$watch('vote', function (nV, oV) {
                    if (nV) {
                        if (userId === scope.vote.owner || userId === scope.vote.owner._id ) {  //so that oit works even when populated
                            scope.remove = function () {
                                voteModel.remove(scope.vote);
                            }
                        }
                    }
                });



			});

		}
	}
});