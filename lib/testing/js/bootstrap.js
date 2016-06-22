/* eslint-env mocha */
/* global __dirname, beforeEach, afterEach */
/* global global:true */
/* eslint no-undef: "off" */

/*
 * Include the globals.
 */
(function() {
    // We use BDD-style 'except' from Chai.
    global.expect      = require('chai').expect;

    // Import data providers.
    global.given       = require('mocha-testdata').given;
    global.givenAsync  = require('mocha-testdata').givenAync;

    // Import spies, and stubs from sinon.
    global.sinon       = require('sinon');
})();

/**
 * Include a JS file relative to the Moodle root.
 *
 * @method  include
 * @param   {String}    filepath        The path to the file relative to the Moodle root.
 */
global.include = function(filepath) {
    var fs = require('fs'),
        path = require('path');

    // Grab the absolute filepath.
    filepath = path.join(__dirname, '../../../', filepath);

    // Resolve it and ensure that the file exists.
    filepath = fs.realpathSync(path.resolve(filepath));

    // Remove the file from the require cache.
    // This is necessary because files are not normally re-included.
    delete require.cache[filepath];
    return require(filepath);
};


/**
 * Add a YUI group filter to load a set of modules.
 *
 * This should typically not be used except for the moodle-core- modules,
 * but there may be times that it is required.
 *
 * @method  addYUIGroupConfig
 * @param   {String}    groupFilter     The name/pattern of the filter - e.g. 'moodle-core-'
 * @param   {String}    base            The path to the build dir for this group.
 */
global.addYUIGroupConfig = function(groupFilter, base) {
    var path = require('path');

    YUI_config.groups[groupFilter] = {
        filter: 'DEBUG',
        base: path.join(__dirname, '../../../', base),
        patterns: {
        }
    };
    YUI_config.groups[groupFilter].patterns[groupFilter] = {
        group: groupFilter
    };

    if (typeof global.YUI !== 'undefined') {
        global.YUI.applyConfig(YUI_config);
    }

    if (typeof global.Y !== 'undefined') {
        global.Y.applyConfig(YUI_config);
    }
};

/*
 * Mock the DOM, and create a new document and window from it.
 */
beforeEach(function() {
    // We will need to mock the DOM.
    var jsdom = require('jsdom');

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

    // Create the document and window.
    global.document = jsdom.jsdom("<html><head><title></title></head><body><h1>Hello YUI!</h1></body></html>");
    global.window = global.document.defaultView;
});

/*
 * Setup YUI.
 *
 * This includes the global YUI, and a light-weight version of our
 * simpleYUI.
 */
beforeEach(function() {
    // Define the base YUI Config.
    global.YUI_config = {
        filter: 'RAW',
        groups: {}
    };

    // Add the standard moodle-core modules.
    global.addYUIGroupConfig('moodle-core-', 'lib/yui/build/');

    // Include the global YUI.
    global.YUI = global.include('lib/yuilib/3.17.2/yui-nodejs/yui-nodejs.js').YUI;

    // Define something to represent simpleYUI.
    // Note, this is currently not a fully-functional version.
    global.Y = YUI({
        useSync: true,
        win: global.window,
        doc: global.document
    }).use('node');
});

/*
 * Initialise the global M object.
 */
beforeEach(function() {
    // Initialise the standard M object used all over Moodle.
    global.M = {
        yui: {},
        cfg: {
            sesskey: 'example',
            wwwroot: 'http://example.org'
        }
    };
});

/*
 * Include javascript-static.js.
 *
 * Much of Moodle JS uses helpers in here, and while we want to remove it,
 * this is currently considered core framework.
 */
beforeEach(function() {
    global.include('lib/javascript-static.js');
});

/*
 * Create a new requireJS Mock injector.
 */
beforeEach(function(done) {
    var fs = require('fs'),
        path = require('path');

    var pathToRequireJS = path.resolve(path.join(__dirname, '../../../', 'node_modules', 'requirejs', 'bin', 'r.js'));
    delete require.cache[fs.realpathSync(pathToRequireJS)];
    global.requirejs = require('requirejs');

    global.requirejs.config({
        baseUrl: path.resolve(path.join(__dirname, '../../../')),
        paths: {
            jquery: 'lib/jquery/jquery-1.12.1',
            'core': 'lib/amd/src'
        }
    });

    global.define = global.requirejs.define;

    // Remove the file from the require cache.
    // This is necessary because files are not normally re-included.
    delete require.cache[fs.realpathSync(path.resolve(path.join(__dirname, '../../../', '/lib/jquery/jquery-1.12.1.js')))];
    delete require.cache[fs.realpathSync(path.resolve(path.join(__dirname, '../../../', '/lib/amd/src/config.js')))];
    done();
});

/*
 * Cleanup of globals.
 */
afterEach(function() {
    delete global.M;
    delete global.YUI;
    delete global.Y;
    delete global.YUI_config;
    delete global.requirejs;
    delete global.define;
});

global.amd = {
    /**
     * Unmock an AMD module.
     *
     * @method  include
     * @param   {String}    filepath        The path to the file relative to the Moodle root.
     */
    unmock: function(module, filepath) {
        var fs = require('fs'),
            path = require('path');

        // Grab the absolute filepath.
        filepath = path.join(__dirname, '../../../', filepath);

        // Resolve it and ensure that the file exists.
        var fullFilepath = fs.realpathSync(path.resolve(filepath + '.js'));

        // Remove the file from the require cache.
        // This is necessary because files are not normally re-included.
        delete require.cache[fullFilepath];

        var config = {paths: {}};
        config.paths[module] = filepath;
        global.requirejs.config(config);

        return global.requirejs(module);
    }
};
