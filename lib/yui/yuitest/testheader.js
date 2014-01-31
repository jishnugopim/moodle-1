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
    return head.appendChild(loader);
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

var moodlesimple = [
    // Include everything from original SimpleYUI,
    // this list can be built using http://yuilibrary.com/yui/configurator/ by selecting all modules
    // listed in https://github.com/yui/yui3/blob/v3.12.0/build/simpleyui/simpleyui.js#L21327
    'yui',
    'yui-base',
    'get',
    'features',
    'loader-base',
    'loader-rollup',
    'loader-yui3',
    'oop',
    'event-custom-base',
    'dom-core',
    'dom-base',
    'color-base',
    'dom-style',
    'selector-native',
    'selector',
    'node-core',
    'node-base',
    'event-base',
    'event-base-ie',
    'pluginhost-base',
    'pluginhost-config',
    'event-delegate',
    'node-event-delegate',
    'node-pluginhost',
    'dom-screen',
    'node-screen',
    'node-style',
    'querystring-stringify-simple',
    'io-base',
    'json-parse',
    'transition',
    'selector-css2',
    'selector-css3',
    'dom-style-ie',

    // Some extras we use everywhere.
    'escape',

    'attribute-core',
    'event-custom-complex',
    'base-core',
    'attribute-base',
    'attribute-extras',
    'attribute-observable',
    'base-observable',
    'base-base',
    'base-pluginhost',
    'base-build',
    'event-synthetic',

    'attribute-complex',
    'event-mouseenter',
    'event-key',
    'event-outside',
    'event-autohide',
    'event-focus',
    'classnamemanager',
    'widget-base',
    'widget-htmlparser',
    'widget-skin',
    'widget-uievents',
    'widget-stdmod',
    'widget-position',
    'widget-position-align',
    'widget-stack',
    'widget-position-constrain',
    'overlay',

    'widget-autohide',
    'button-core',
    'button-plugin',
    'widget-buttons',
    'widget-modality',
    'panel',
    'yui-throttle',
    'dd-ddm-base',
    'dd-drag',
    'dd-plugin',

    // Cache is used by moodle-core-tooltip which we include everywhere.
    'cache-base'
];

// Add moodleyui - TODO find a better way of doing this.
Y = YUI().use(moodlesimple);

YUI.applyConfig({
    modules: {
        'moodle-core-tooltip': {
            fullpath: findBuildDirectory('lib', 'tooltip')
        },
        'moodle-core-popuphelp': {
            fullpath: findBuildDirectory('lib', 'popuphelp')
        },
        'moodle-core-dock-loader': {
            fullpath: findBuildDirectory('lib', 'dock-loader')
        },
        'moodle-core-notification-dialogue': {
            fullpath: findBuildDirectory('lib', 'notification-dialogue')
        }
    }
});

// Add javascript-static.js.
moodleTestAddScript('/lib/javascript-static.js');
