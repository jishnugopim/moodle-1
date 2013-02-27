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

// Grab the document header
var head = document.getElementsByTagName('head')[0];
var testheader = document.getElementsByTagName('script');
var testheader = document.getElementById('testheader');
M.cfg.wwwroot = testheader.src.replace(/\/lib\/yui\/.*$/, '');

// Add simpleyui
var loader = document.createElement('script');
loader.src = M.cfg.wwwroot + '/lib/yuilib/3.8.0/build/simpleyui/simpleyui.js';
head.appendChild(loader);

// Add javascript-static.js
var loader = document.createElement('script');
loader.src = M.cfg.wwwroot + '/lib/javascript-static.js';
head.appendChild(loader);
YUI_config = {
    modules: {
        'test-console': {
            fullpath: M.cfg.wwwroot + '/lib/yui/common/scripts/test-console.js',
            requires : ['console-filters'],
            skinnable: true
        },
        'skin-sam-test-console': {
            fullpath: M.cfg.wwwroot + '/lib/yui/common/scripts/test-console.css',
            type    : 'css'
        }
    }
};

function add_benchmark_tools() {
    var head = document.getElementsByTagName('head')[0];
    var applet = document.createElement('applet');
    applet.code = 'nano';
    applet.archive = "https://github.com/bestiejs/benchmark.js/raw/v1.0.0/nano.jar";
    applet.style = "display: none;";

    var script = document.createElement('script');
    script.src = "http://pieisgood.org/misc/benchmark/benchmark.js";

    head.appendChild(applet);
    head.appendChild(script);
}
