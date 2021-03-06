var Schema = require('mongoose').Schema;
var voteCount = require('./vote-count');

module.exports = function (MR, userMRM, novelMRM) {

    var novelVoteMR = MR.model('novelVote', {
        subject: { type: Schema.Types.ObjectId, ref: 'novel', required: true },
        creation_date: { type: Date, default: Date.now },
        value: Boolean,
        fb_post_id: String //when user shares the voting, this will be filled with facebook post id
    }, {
        permissions: {
            C: 1,
            R: 0,
            U: 50,
            D: 50
        },
        pres:{
            onPrecreate: function (next, vote) {
                novelVoteMR.model.findOne({subject: vote.subject, owner:vote.owner}).exec()
                    .then(function (existingVote) {
                        if (existingVote) {
                            // if vote already exists, then the previous must be removed
                            existingVote.remove(function (err) {
                                next();
                            });
                            // this should not happen with official client, since the client app should guard this with it's logic
                        } else {
                            next();

                        }

                    });
            }
        }

    });

	novelVoteMR.model.on('create', function (vote) {
		var incrementFor = function (doc) {
			if (doc) {
				voteCount.incrementVoteCounts(doc, vote);
			}
		};
		novelMRM.model.findOne({_id: vote.subject}).exec()
			.then(incrementFor).end();
	});

	novelVoteMR.model.on('remove', function (vote) {
		var decrementFor = function (doc) {
			if (doc) {
				voteCount.decrementVoteCounts(doc, vote);
			}
		};
		novelMRM.model.findOne({_id: vote.subject}).exec()
			.then(decrementFor).end();
	});

//	novelVoteMR.model.on('preupdate', function (doc, evName, previous){
//
//		decrementVoteCounts(doc, doc);	// novelVote doc
//		userMRM.model.findOne({_id: vote.owner}).exec()
//			.then(function (obj) {
//
//			});	//user docs
//
//		incrementVoteCounts(doc);
//
//	});



	return novelVoteMR;
};
