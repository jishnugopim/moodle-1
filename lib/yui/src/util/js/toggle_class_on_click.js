/**
 * Finds all nodes that match the given CSS selector and attaches events to them
 * so that they toggle a given classname when clicked.
 *
 * @param {YUI} Y
 * @param {string} id An id containing elements to target
 * @param {string} cssselector A selector to use to find targets
 * @param {string} toggleclassname A classname to toggle
 */
M.util.init_toggle_class_on_click = function(Y, id, cssselector, toggleclassname, togglecssselector) {

    if (togglecssselector == '') {
        togglecssselector = cssselector;
    }

    var node = Y.one('#'+id);
    node.all(cssselector).each(function(n){
        n.on('click', function(e){
            e.stopPropagation();
            if (e.target.test(cssselector) && !e.target.test('a') && !e.target.test('img')) {
                if (this.test(togglecssselector)) {
                    this.toggleClass(toggleclassname);
                } else {
                    this.ancestor(togglecssselector).toggleClass(toggleclassname);
            }
            }
        }, n);
    });
    // Attach this click event to the node rather than all selectors... will be much better
    // for performance
    node.on('click', function(e){
        if (e.target.hasClass('addtoall')) {
            this.all(togglecssselector).addClass(toggleclassname);
        } else if (e.target.hasClass('removefromall')) {
            this.all(togglecssselector+'.'+toggleclassname).removeClass(toggleclassname);
        }
    }, node);
};
