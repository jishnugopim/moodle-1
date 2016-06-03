(function() {
    var path = require("path"),
        YUI = require(path.join(__dirname, "../../../yuilib/3.17.2/yui-nodejs/yui-nodejs-debug.js"));

    global.initYUI = function() {
        global.Y = new YUI.YUI();
    };

    global.Y = new YUI.YUI();
})();
