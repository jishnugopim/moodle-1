/**
 * Adds lightbox hidden element that covers the whole node.
 *
 * @param {YUI} Y
 * @param {Node} the node lightbox should be added to
 * @retun {Node} created lightbox node
 */
M.util.add_lightbox = function(Y, node) {
    var WAITICON = {'pix':"i/loading_small",'component':'moodle'};

    // Check if lightbox is already there
    if (node.one('.lightbox')) {
        return node.one('.lightbox');
    }

    node.setStyle('position', 'relative');
    var waiticon = Y.Node.create('<img />')
    .setAttrs({
        'src' : M.util.image_url(WAITICON.pix, WAITICON.component)
    })
    .setStyles({
        'position' : 'relative',
        'top' : '50%'
    });

    var lightbox = Y.Node.create('<div></div>')
    .setStyles({
        'opacity' : '.75',
        'position' : 'absolute',
        'width' : '100%',
        'height' : '100%',
        'top' : 0,
        'left' : 0,
        'backgroundColor' : 'white',
        'textAlign' : 'center'
    })
    .setAttribute('class', 'lightbox')
    .hide();

    lightbox.appendChild(waiticon);
    node.append(lightbox);
    return lightbox;
};
