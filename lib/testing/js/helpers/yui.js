(function() {
    var path = require("path"),
        jsdom = require('jsdom');

    // Turn off all the things we don't want.
    jsdom.defaultDocumentFeatures = {
            // Don't bring in outside resources.
            FetchExternalResources   : false,
            // Don't process them.
            ProcessExternalResources : false,
            // Don't expose Mutation events (for performance).
            MutationEvents           : false,
            // Do not use their implementation of QSA.
            QuerySelector            : false
        };

    global.getYUI = function() {
        var YUI = require(path.join(__dirname, "../../../yuilib/3.17.2/yui-nodejs/yui-nodejs.js")).YUI,
            // Create the document and window.
            document = jsdom.jsdom("<html><head><title></title></head><body><h1>Hello YUI!</h1></body></html>"),
            window = document.defaultView;

        var Y = YUI({
            useSync: true,
            win: window,
            doc: document
        }).use('node');

        return Y;
    };

    global.initYUI = function() {
        global.Y = global.getYUI();
    };

    global.initYUI();
})();
