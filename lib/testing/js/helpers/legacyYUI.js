(function() {
    var path = require('path'),
        fs = require('fs');

    global.requireLegacyFile = function(filepath) {
        eval(fs.readFileSync(path.join(__dirname, '../../../../', filepath)) + '');
    };
})();
