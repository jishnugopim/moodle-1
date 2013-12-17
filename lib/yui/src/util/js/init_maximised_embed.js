/** Useful for full embedding of various stuff */
M.util.init_maximised_embed = function(Y, id) {
    var obj = Y.one('#'+id);
    if (!obj) {
        return;
    }

    var get_htmlelement_size = function(el, prop) {
        if (Y.Lang.isString(el)) {
            el = Y.one('#' + el);
        }
        // Ensure element exists.
        if (el) {
            var val = el.getStyle(prop);
            if (val === 'auto') {
                val = el.getComputedStyle(prop);
            }
            return parseInt(val, 10);
        } else {
            return 0;
        }
    };

    var resize_object = function() {
        obj.setStyle('width', '0px');
        obj.setStyle('height', '0px');
        var newwidth = get_htmlelement_size('maincontent', 'width') - 35;

        if (newwidth > 500) {
            obj.setStyle('width', newwidth  + 'px');
        } else {
            obj.setStyle('width', '500px');
        }

        var headerheight = get_htmlelement_size('page-header', 'height');
        var footerheight = get_htmlelement_size('page-footer', 'height');
        var newheight = parseInt(Y.one('body').get('winHeight'), 10) - footerheight - headerheight - 100;
        if (newheight < 400) {
            newheight = 400;
        }
        obj.setStyle('height', newheight+'px');
    };

    resize_object();
    // fix layout if window resized too
    window.onresize = function() {
        resize_object();
    };
};
