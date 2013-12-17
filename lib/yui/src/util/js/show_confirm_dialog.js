/* jshint eqeqeq:false, evil:true */
/**
 * Prints a confirmation dialog in the style of DOM.confirm().
 * @param object event A YUI DOM event or null if launched manually
 * @param string message The message to show in the dialog
 * @param string url The URL to forward to if YES is clicked. Disabled if fn is given
 * @param function fn A JS function to run if YES is clicked.
 */
M.util.show_confirm_dialog = function(e, args) {
    var target = e.target;
    if (e.preventDefault) {
        e.preventDefault();
    }

    YUI().use('yui2-container', 'yui2-event', function(Y) {
        var simpledialog = new Y.YUI2.widget.SimpleDialog('confirmdialog',
            {width: '300px',
              fixedcenter: true,
              modal: true,
              visible: false,
              draggable: false
            }
        );

        simpledialog.setHeader(M.str.admin.confirmation);
        simpledialog.setBody(args.message);
        simpledialog.cfg.setProperty('icon', Y.YUI2.widget.SimpleDialog.ICON_WARN);

        var handle_cancel = function() {
            simpledialog.hide();
        };

        var handle_yes = function() {
            simpledialog.hide();

            if (args.callback) {
                // args comes from PHP, so callback will be a string, needs to be evaluated by JS
                var callback = null;
                if (Y.Lang.isFunction(args.callback)) {
                    callback = args.callback;
                } else {
                    callback = eval('('+args.callback+')');
                }

                var sc;

                if (Y.Lang.isObject(args.scope)) {
                    sc = args.scope;
                } else {
                    sc = e.target;
                }

                if (args.callbackargs) {
                    callback.apply(sc, args.callbackargs);
                } else {
                    callback.apply(sc);
                }
                return;
            }

            var targetancestor = null,
                targetform = null;

            if (target.test('a')) {
                window.location = target.get('href');

            } else if ((targetancestor = target.ancestor('a')) !== null) {
                window.location = targetancestor.get('href');

            } else if (target.test('input')) {
                targetform = target.ancestor(function(node) { return node.get('tagName').toLowerCase() == 'form'; });
                // We cannot use target.ancestor('form') on the previous line
                // because of http://yuilibrary.com/projects/yui3/ticket/2531561
                if (!targetform) {
                    return;
                }
                if (target.get('name') && target.get('value')) {
                    targetform.append('<input type="hidden" name="' + target.get('name') +
                                    '" value="' + target.get('value') + '">');
                }
                targetform.submit();

            } else if (target.get('tagName').toLowerCase() == 'form') {
                // We cannot use target.test('form') on the previous line because of
                // http://yuilibrary.com/projects/yui3/ticket/2531561
                target.submit();

            } else if (M.cfg.developerdebug) {
                alert("Element of type " + target.get('tagName') + " is not supported by the M.util.show_confirm_dialog function. Use A, INPUT, or FORM");
            }
        };

        if (!args.cancellabel) {
            args.cancellabel = M.str.moodle.cancel;
        }
        if (!args.continuelabel) {
            args.continuelabel = M.str.moodle.yes;
        }

        var buttons = [
            {text: args.cancellabel,   handler: handle_cancel, isDefault: true},
            {text: args.continuelabel, handler: handle_yes}
        ];

        simpledialog.cfg.queueProperty('buttons', buttons);

        simpledialog.render(document.body);
        simpledialog.show();
    });
};
