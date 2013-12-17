/**
 * Makes a best effort to connect back to Moodle to update a user preference,
 * however, there is no mechanism for finding out if the update succeeded.
 *
 * Before you can use this function in your JavsScript, you must have called
 * user_preference_allow_ajax_update from moodlelib.php to tell Moodle that
 * the udpate is allowed, and how to safely clean and submitted values.
 *
 * @param String name the name of the setting to udpate.
 * @param String the value to set it to.
 */
M.util.set_user_preference = function(name, value) {
    YUI().use('io', function(Y) {
        var url = M.cfg.wwwroot + '/lib/ajax/setuserpref.php?sesskey=' +
                M.cfg.sesskey + '&pref=' + encodeURI(name) + '&value=' + encodeURI(value);

        // If we are a developer, ensure that failures are reported.
        var cfg = {
                method: 'get',
                on: {}
            };
        if (M.cfg.developerdebug) {
            cfg.on.failure = function() {
                alert("Error updating user preference '" + name + "' using ajax. Clicking this link will repeat the Ajax call that failed so you can see the error: ");
            };
        }

        // Make the request.
        Y.io(url, cfg);
    });
};
