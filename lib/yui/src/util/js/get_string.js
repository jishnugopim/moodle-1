/**
 * Returns a string registered in advance for usage in JavaScript
 *
 * If you do not pass the third parameter, the function will just return
 * the corresponding value from the M.str object. If the third parameter is
 * provided, the function performs {$a} placeholder substitution in the
 * same way as PHP get_string() in Moodle does.
 *
 * @param {String} identifier string identifier
 * @param {String} component the component providing the string
 * @param {Object|String} a optional variable to populate placeholder with
 */
M.util.get_string = function(identifier, component, a) {
    var stringvalue;

    if (M.cfg.developerdebug) {
        // creating new instance if YUI is not optimal but it seems to be better way then
        // require the instance via the function API - note that it is used in rare cases
        // for debugging only anyway
        // To ensure we don't kill browser performance if hundreds of get_string requests
        // are made we cache the instance we generate within the M.util namespace.
        // We don't publicly define the variable so that it doesn't get abused.
        if (typeof M.util.get_string_yui_instance === 'undefined') {
            M.util.get_string_yui_instance = new YUI({ debug : true });
        }
        var Y = M.util.get_string_yui_instance;
    }

    if (!M.str.hasOwnProperty(component) || !M.str[component].hasOwnProperty(identifier)) {
        stringvalue = '[[' + identifier + ',' + component + ']]';
        if (M.cfg.developerdebug) {
            Y.log('undefined string ' + stringvalue, 'warn', 'M.util.get_string');
        }
        return stringvalue;
    }

    stringvalue = M.str[component][identifier];

    if (typeof a == 'undefined') {
        // no placeholder substitution requested
        return stringvalue;
    }

    if (typeof a == 'number' || typeof a == 'string') {
        // replace all occurrences of {$a} with the placeholder value
        stringvalue = stringvalue.replace(/\{\$a\}/g, a);
        return stringvalue;
    }

    if (typeof a == 'object') {
        // replace {$a->key} placeholders
        for (var key in a) {
            if (typeof a[key] != 'number' && typeof a[key] != 'string') {
                if (M.cfg.developerdebug) {
                    Y.log('invalid value type for $a->' + key, 'warn', 'M.util.get_string');
                }
                continue;
            }
            var search = '{$a->' + key + '}';
            search = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            search = new RegExp(search, 'g');
            stringvalue = stringvalue.replace(search, a[key]);
        }
        return stringvalue;
    }

    if (M.cfg.developerdebug) {
        Y.log('incorrect placeholder type', 'warn', 'M.util.get_string');
    }
    return stringvalue;
};
