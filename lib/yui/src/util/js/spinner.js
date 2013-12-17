/**
 * Appends a hidden spinner element to the specified node.
 *
 * @param {YUI} Y
 * @param {Node} the node the spinner should be added to
 * @return {Node} created spinner node
 */
M.util.add_spinner = function(Y, node) {
    var WAITICON = {'pix':"i/loading_small",'component':'moodle'};

    // Check if spinner is already there
    if (node.one('.spinner')) {
        return node.one('.spinner');
    }

    var spinner = Y.Node.create('<img />')
        .setAttribute('src', M.util.image_url(WAITICON.pix, WAITICON.component))
        .addClass('spinner')
        .addClass('iconsmall')
        .hide();

    node.append(spinner);
    return spinner;
};
