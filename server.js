var http = require('http');
http.globalAgent.maxSockets = 100;
http.Agent.maxSockets = 100;
/**
 * Module dependencies.
 */
var logger = require('mean-logger');

var mongoose = require('mongoose');
var pjson = require('./package.json');

//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV = pjson.env || 'dev';
var envSettings = require('./server/' + env);
var express = require('express');
var pathChecker = require('./server/pathChecker.js');
var app = module.exports = express();
var fs = require('fs');
var moonridge = require('moonridge');

var MR = moonridge.init(mongoose);

var models = require('./models')(MR);


app.configure(function(){
    app.set('port', process.env.PORT || pjson.port);
    app.set('showStackError', true);

    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    //Setting the fav icon and static folder
    app.use(express.favicon());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(app.router);
    if (env == 'production') {
        app.use(require('prerender-node').set('prerenderServiceUrl', 'http://localhost:3000/'));

        process.on('uncaughtException', function(err) {
            console.log(err);
        });
    }
});

mongoose.connect(envSettings.mongoConn, function (err) {
    // if we failed to connect, abort
    if (err) {
        throw err;
    } else {
        console.log("DB connected succesfully");
    }

});

var server = app.listen(app.get('port'), function () {

	var io = require('socket.io').listen(server);
	io.configure(function (){
		io.set('authorization', function (handshake, CB) {
			var socket = this;
			var aToken = handshake.query.aToken;
			console.log("user wants to authorize: " + aToken );
			models.user.model.findOne({access_token: aToken}).exec().then(function (user) {
				if (user) {
					socket.user = user;
					console.log("Authenticated user: " + user.name);
					CB(null, true);
				} else {
					//TODO call facebook and get users identity, store token in the users document, invalidate after 2 hours
				}

			}, function (err) {
				console.log("auth error " + err);
				CB(null, false);
			})
		});
	});

	moonridge.createServer(io, app);

	app.get('*', function(req, res){
        var pathName = req._parsedUrl.pathname;
        var filePath = './public' + pathName;
        fs.exists(filePath, function (exists)
        {
            if(exists)
            {
                res.sendfile(filePath);
            } else {
                if(pathChecker(pathName)){
                    res.sendfile('./public/index.html');
                } else {
                    res.status(404);
                    res.sendfile('./public/index.html');
                }
            }

        });

    });
    console.info("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});



