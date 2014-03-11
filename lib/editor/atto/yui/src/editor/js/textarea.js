/**
 * @module moodle-editor_atto-editor
 */

function EditorTextArea() {}

EditorTextArea.ATTRS= {
};

EditorTextArea.prototype = {
    /**
     * Copy and clean the text from the textarea into the contenteditable div.
     * If the text is empty, provide a default paragraph tag to hold the content.
     *
     * @method updateFromTextArea
     * @chainable
     */
    updateFromTextArea: function() {
        // Clear it first.
        this.editor.setHTML('');

        // Copy text to editable div.
        this.editor.append(this.textarea.get('value'));

        // Clean it.
        this.cleanEditorHTML();

        // Insert a paragraph in the empty contenteditable div.
        if (this.editor.getHTML() === '') {
            if (Y.UA.ie && Y.UA.ie < 10) {
                this.editor.setHTML('<p></p>');
            } else {
                this.editor.setHTML('<p><br></p>');
            }
        }
    },

    /**
     * Copy the text from the contenteditable to the textarea which it replaced.
     *
     * @method updateOriginal
     * @private
     * @chainable
     */
    updateOriginal : function() {
        // Insert the cleaned content.
        this.textarea.set('value', this.getCleanHTML());

        // Trigger the onchange callback on the textarea, essentially to notify moodle-core-formchangechecker.
        this.textarea.simulate('change');

        // Trigger handlers for this action.
        this.fire('change');
    }
};

Y.Base.mix(Y.M.editor_atto.Editor, [EditorTextArea]);
