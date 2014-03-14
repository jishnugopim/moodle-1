/**
 * @module moodle-editor_atto-editor-foo
 */

function EditorFilepicker() {}

EditorFilepicker.ATTRS= {
    /**
     * The options for the filepicker.
     *
     * @attrbute filepickeroptions
     * @type object
     * @default {}
     */
    filepickeroptions: {
        value: {}
    }
};

EditorFilepicker.prototype = {
    /**
     * Should we show the filepicker for this filetype?
     *
     * @method canShowFilepicker
     * @param string type The media type for the file picker
     * @return boolean
     */
    canShowFilepicker: function(type) {
        return (typeof this.get('filepickeroptions')[type] !== 'undefined');
    },

    /**
     * Show the filepicker.
     *
     * @method showFilepicker
     * @param {string} type The media type for the file picker.
     * @param {function} callback used on success.
     * @param {object} context The context from which to call the callback.
     */
    showFilepicker: function(type, callback, context) {
        var self = this;
        Y.use('core_filepicker', function (Y) {
            var options = Y.clone(self.get('filepickeroptions')[type], true);
            options.formcallback = callback;
            if (context) {
                options.magicscope = context;
            }

            M.core_filepicker.show(Y, options);
        });
    }
};

Y.Base.mix(Y.M.editor_atto.Editor, [EditorFilepicker]);
