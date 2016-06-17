/* eslint-env mocha */

// Utilities.
var fs = require('fs'),
    path = require('path');

// Mock requirejs.
var requirejs = require('requirejs'),
    Injector = require('requirejs-mock').provide(requirejs);

// We will need to mock the DOM.
var jsdom = require('jsdom');

/*
 * Include the globals.
 */
(function() {
    // We use BDD-style 'except' from Chai.
    expect      = require('chai').expect;

    // Import data providers.
    given       = require('mocha-testdata').given;
    givenAsync  = require('mocha-testdata').givenAync;

    // Import spies, and stubs from sinon.
    sinon       = require('sinon');
})();

/**
 * Include a JS file relative to the Moodle root.
 *
 * @method  include
 * @param   {String}    filepath        The path to the file relative to the Moodle root.
 */
include = function(filepath) {
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
addYUIGroupConfig = function(groupFilter, base) {
    YUI_config.groups[groupFilter] = {
        filter: 'DEBUG',
        base: path.join(__dirname, '../../../', base),
        patterns: {
        }
    };
    YUI_config.groups[groupFilter].patterns[groupFilter] = {
        group: groupFilter
    };

    if (typeof YUI !== 'undefined') {
        YUI.applyConfig(YUI_config);
    }

    if (typeof Y !== 'undefined') {
        Y.applyConfig(YUI_config);
    }
};

/*
 * Mock the DOM, and create a new document and window from it.
 */
beforeEach(function() {
    // Mock the DOM.
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
    document = jsdom.jsdom("<html><head><title></title></head><body><h1>Hello YUI!</h1></body></html>"),
    window = document.defaultView;
});

/*
 * Setup YUI.
 *
 * This includes the global YUI, and a light-weight version of our
 * simpleYUI.
 */
beforeEach(function() {
    // Define the base YUI Config.
    YUI_config = {
        filter: 'RAW',
        groups: {}
    };

    // Add the standard moodle-core modules.
    addYUIGroupConfig('moodle-core-', 'lib/yui/build/');

    // Include the global YUI.
    YUI = include('lib/yuilib/3.17.2/yui-nodejs/yui-nodejs.js').YUI;

    // Define something to represent simpleYUI.
    // Note, this is currently not a fully-functional version.
    Y = YUI({
        useSync: true,
        win: window,
        doc: document
    }).use('node');
});

/*
 * Initialise the global M object.
 */
beforeEach(function() {
    // Initialise the standard M object used all over Moodle.
    M = {
        yui: {},
        cfg: {
            sesskey: 'example',
            wwwroot: 'http://example.org/'
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
    include('lib/javascript-static.js');
});

/*
 * Create a new requireJS Mock injector.
 */
beforeEach(function() {
    injector = Injector.create();
});

/*
 * Cleanup of globals.
 */
afterEach(function() {
    delete M;
    delete YUI;
    delete Y;
    delete YUI_config;
});
