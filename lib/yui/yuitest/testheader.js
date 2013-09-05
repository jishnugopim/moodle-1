// Set up the global M variable
var M = {
    yui: {
    },
    cfg: {
        developerdebug: false,
        jsrev: -1,
        slasharguments: 1,
        svgicons: true,
        themerev: -1,
        theme: 'base'
    }
};

// Grab the document header.
var head = document.getElementsByTagName('head')[0];
var testheader = document.getElementsByTagName('script');
var testheader = document.getElementById('testheader');
M.cfg.wwwroot = testheader.src.replace(/\/lib\/yui\/.*$/, '');

var moodleTestAddScript = function(wwwroot, source) {
    // The wwwroot is optional so source may be the first argument.
    if (!source) {
        source = wwwroot;
        wwwroot = M.cfg.wwwroot;
    }

    var loader = document.createElement('script');
    loader.src = wwwroot + source;
    head.appendChild(loader);
};

var componentMapping = {
    'mod': 'mod'
};

var findBuildDirectory = function(component, modulename, submodule) {
    var componentdir = component;
    if (component === 'lib') {
        component = 'core';
    } else {
        var componentParts = component.split('_'),
            mainComponent = componentParts.shift();
        if (componentMapping.hasOwnProperty(mainComponent)) {
            componentdir = componentMapping[mainComponent] + '/' + componentParts.join('_');
        }
    }
    if (submodule) {
        submodule = '-' + submodule;
    } else {
        submodule = '';
    }
    modulename = 'moodle-' + component + '-' + modulename + submodule;
    var filename = modulename + '-min.js';

    var returnValue = M.cfg.wwwroot + '/' + componentdir + '/yui/build/' + modulename + '/' + filename;
    return returnValue;
};
// To prevent a linting error.
findBuildDirectory('', '');

var YUI_config = {
    filter: (window.location.search.match(/[?&]filter=([^&]+)/) || [])[1] || 'raw',
    groups: {
        moodle: {
            modules: {
                'moodle-core-notification-dialogue': {
                    fullpath: findBuildDirectory('lib', 'notification', 'dialogue'),
                    requires: ['base','node','panel','event-key', 'dd-plugin']
                },
                'moodle-core-notification-alert': {
                    fullpath: findBuildDirectory('lib', 'notification', 'alert'),
                    requires: []
                },
                'moodle-core-notification-confirm': {
                    fullpath: findBuildDirectory('lib', 'notification', 'confirm'),
                    requires: []
                },
                'moodle-core-notification-exception': {
                    fullpath: findBuildDirectory('lib', 'notification', 'exception'),
                    requires: []
                },
                'moodle-core-notification-ajaxexception': {
                    fullpath: findBuildDirectory('lib', 'notification', 'ajaxexception'),
                    requires: []
                },
                'moodle-core-notification': {
                    fullpath: findBuildDirectory('lib', 'notification'),
                    requires: [
                        'moodle-core-notification-dialogue',
                        'moodle-core-notification-alert',
                        'moodle-core-notification-confirm',
                        'moodle-core-notification-exception',
                        'moodle-core-notification-ajaxexception'
                    ]
                }
            }
        }
    }
};

// Add simpleyui.
moodleTestAddScript('/lib/yuilib/3.9.1/build/simpleyui/simpleyui.js');

// Add javascript-static.js.
moodleTestAddScript('/lib/javascript-static.js');
