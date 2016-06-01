var express = require('express'),
    app = express(),
    pathToRegexp = require('path-to-regexp'),
    fs = require('fs'),
    rootdir = process.cwd()
    ;

app.get('/**/tests/js/*.test(.js)?', function (req, res) {
    var keys,
        pathMatch = pathToRegexp('/**/tests/js/*.test(.js)?', keys),
        jsFilePath = rootdir + req.path.replace(new RegExp('\/tests\/js\/(.*).test(.js)?'), '/tests/js/$1.js'),
        fixtureFilePath = rootdir + req.path.replace(new RegExp('\/tests\/js\/(.*).test(.js)?'), '/tests/js/$1.fixture'),
        sendPath = req.path.replace('.test', ''),
        result = pathMatch.exec(req.path)
        ;

    fs.stat(jsFilePath, function(err, stats) {
            if (err) {
                return res.sendStatus(404);
            }
        });

    if (result[4] === '.js') {
        return res.sendFile(jsFilePath);
    } else {
        var jsFile = req.path.replace(new RegExp('^.*\/([^/]*)\.test'), '$1.test.js');
        fs.readFile(rootdir + '/lib/testing/js/wrapper.test', {
                    encoding: 'utf-8',
                }, function(err, content) {
            var fixtureContent = '';

            fs.stat(fixtureFilePath, function(err, data) {
                    if (!err) {
                        fixtureContent = fs.readFileSync(fixtureFilePath);
                    }
                });

            content = content
				.replace('##testFile##', './' + jsFile)
				.replace('##fixtureContent##', fixtureContent)
                ;

            return res.send(content);
        });
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
