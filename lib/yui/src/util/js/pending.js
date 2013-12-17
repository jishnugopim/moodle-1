/**
 * @var pending_js - The keys are the list of all pending js actions.
 * @type Object
 */
M.util.pending_js = [];
M.util.complete_js = [];

/**
 * Register any long running javascript code with a unique identifier.
 * Should be followed with a call to js_complete with a matching
 * idenfitier when the code is complete. May also be called with no arguments
 * to test if there is any js calls pending. This is relied on by behat so that
 * it can wait for all pending updates before interacting with a page.
 * @param String uniqid - optional, if provided,
 *                        registers this identifier until js_complete is called.
 * @return boolean - True if there is any pending js.
 */
M.util.js_pending = function(uniqid) {
    if (uniqid !== false) {
        M.util.pending_js.push(uniqid);
    }

    return M.util.pending_js.length;
};

/**
 * Register listeners for Y.io start/end so we can wait for them in behat.
 */
M.util.js_watch_io = function() {
    YUI.add('moodle-core-io', function(Y) {
        Y.on('io:start', function(id) {
            M.util.js_pending('io:' + id);
        });
        Y.on('io:end', function(id) {
            M.util.js_complete('io:' + id);
        });
    });
    YUI.applyConfig({
        modules: {
            'moodle-core-io': {
                after: ['io-base']
            },
            'io-base': {
                requires: ['moodle-core-io'],
            }
        }
    });

};

// Start this asap.
M.util.js_pending('init');
M.util.js_watch_io();

/**
 * Unregister any long running javascript code by unique identifier.
 * This function should form a matching pair with js_pending
 *
 * @param String uniqid - required, unregisters this identifier
 * @return boolean - True if there is any pending js.
 */
M.util.js_complete = function(uniqid) {
    var index = M.util.pending_js.indexOf(uniqid);
    if (index >= 0) {
        M.util.complete_js.push(M.util.pending_js.splice(index, 1));
    }

    return M.util.pending_js.length;
};
