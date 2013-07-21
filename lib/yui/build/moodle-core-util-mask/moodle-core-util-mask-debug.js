YUI.add('moodle-core-util-mask', function (Y, NAME) {

/**
 * @module moodle-core-util
 * @submodule moodle-core-util-mask
 */
Y.mix(Y.Node.prototype, {
    /**
     * Add or retrieve a mask for the current node.
     *
     * @method getMask
     * @param {String} customclass A custom class applied to the mask.
     * @return {Node} The mask that was added.
     */
    getMask: function(customclass) {
        // Check if the mask is already there.
        var mask = this.one('> .mask');
        if (mask) {
            return mask;
        }

        Y.use('moodle-course-coursebase-skin');

        // The parent Node must have a relative position.
        this.setStyle('position', 'relative');

        mask = Y.Node.create(
            '<div class="mask">' +
                '<div>' +
                    '<div class="mask-content"/>' +
                '</div>' +
            '</div>'
        );
        mask.hide();
        if (customclass) {
            mask.addClass(customclass);
        }

        this.appendChild(mask);
        return mask;
    }

});


}, '@VERSION@', {"requires": ["node"]});
