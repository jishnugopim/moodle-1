/**
 * @module moodle-editor_atto-editor-foo
 */

function EditorToolbar() {}

EditorToolbar.ATTRS= {
};

EditorToolbar.prototype = {
    /**
     * A reference to the toolbar Node.
     *
     * @property toolbar
     * @type Node
     */
    toolbar: null,

    /**
     * Setup the toolbar on the editor.
     *
     * @method setupToolbar
     * @chainable
     */
    setupToolbar: function() {
        this.toolbar = Y.Node.create('<div class="' + CSS.TOOLBAR + '" role="toolbar" aria-live="off"/>');
        this._wrapper.appendChild(this.toolbar);

        if (this.textareaLabel) {
            this.toolbar.setAttribute('aria-labelledby', this.textareaLabel.get("id"));
        }

        // Add keyboard navigation for the toolbar.
        this.setupToolbarNavigation();

        return this;
    }
};

Y.Base.mix(Y.M.editor_atto.Editor, [EditorToolbar]);
