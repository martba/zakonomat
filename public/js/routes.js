(function(exports){
    var tP = '/templates/views/';

    //application routing
    exports.routes = [
        { route:'/', resolve: {templateUrl: tP + 'root.html'}},
        { route:'/404', resolve: {templateUrl: tP + '404.html'}},
        { route:'/login', resolve: {templateUrl: '/templates/login.html'}},
        { route:'/navrhy', resolve: {templateUrl:tP + 'novels.html', reloadOnSearch: false}},
        { route:'/navrh', resolve: {templateUrl:tP + 'navrh.html', reloadOnSearch: false}}

    ];

})(typeof exports === 'undefined'? this['routesModule']={}: exports);

