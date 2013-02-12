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
