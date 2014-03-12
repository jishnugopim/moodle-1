/**
 * @module moodle-editor_atto-editor-plugin
 */

function EditorPluginDialogue() {}

EditorPluginDialogue.ATTRS= {
};

EditorPluginDialogue.prototype = {
    /**
     * A reference to the instantiated dialogue.
     *
     * @property _dialogue
     * @private
     * @type M.core.Dialogue
     */
    _dialogue: null,

    /**
     * Fetch the instantiated dialogue. If a dialogue has not yet been created,
     * instantiate one.
     */
    getDialogue: function(config) {
        if (!this._dialogue) {
            // Merge the default configuration with any provided configuration.
            var dialogueConfig = Y.merge({
                    visible: false,
                    modal: true,
                    close: true,
                    draggable: true
                }, config);

            // Instantiate the dialogue.
            this._dialogue = new M.core.dialogue(dialogueConfig);
        }
        return this._dialogue;
    }
};

Y.Base.mix(Y.M.editor_atto.EditorPlugin, [EditorPluginDialogue]);
