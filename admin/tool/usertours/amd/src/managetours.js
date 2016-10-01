/**
 * Tour management code.
 *
 * @module     tool_usertours/managetours
 * @class      managetours
 * @package    tool_usertours
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 */
define(
['jquery', 'core/ajax', 'core/str', 'core/notification'],
function($, ajax, str, notification) {
    var manager = {
        removeTour: function(e) {
            e.preventDefault();

            str.get_strings([
                {
                    key:        'confirmtourremovaltitle',
                    component:  'tool_usertours'
                },
                {
                    key:        'confirmtourremovalquestion',
                    component:  'tool_usertours'
                },
                {
                    key:        'yes',
                    component:  'moodle'
                },
                {
                    key:        'no',
                    component:  'moodle'
                }
            ]).done(function(s) {
                notification.confirm(s[0], s[1], s[2], s[3], $.proxy(function() {
                    window.location = $(this).attr('href');
                }, e.currentTarget));
            });
        },

        setup: function() {
            $('body').delegate('[data-action="delete"]', 'click', manager.removeTour);
        }
    };

    return /** @alias module:tool_usertours/managetours */ {
        /**
         * Setup the tour management UI.
         *
         * @method          setup
         */
        setup: manager.setup
    };
});
