/* jshint eqeqeq: false, noempty: false */
/**
 * Set focus on username or password field of the login form
 */
M.util.focus_login_form = function(Y) {
    var username = Y.one('#username');
    var password = Y.one('#password');

    if (username === null || password === null) {
        // something is wrong here
        return;
    }

    var curElement = document.activeElement;
    if (curElement == 'undefined') {
        // legacy browser - skip refocus protection
    } else if (curElement.tagName == 'INPUT') {
        // user was probably faster to focus something, do not mess with focus
        return;
    }

    if (username.get('value') === '') {
        username.focus();
    } else {
        password.focus();
    }
};

/**
 * Set focus on login error message
 */
M.util.focus_login_error = function(Y) {
    var errorlog = Y.one('#loginerrormessage');

    if (errorlog) {
        errorlog.focus();
    }
};
