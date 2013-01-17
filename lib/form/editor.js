// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript library for dealing with form editor functionality.
 *
 * @package core_form
 * @copyright 2011 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

M.form_editor = {
    Y : null,

    toggleNodeTemplate : null,

    /*
     * Set up basic values for static access
     */
    init : function(Y, options) {
        this.Y = Y;

        // methods
        this.initialiseEditorToggles(10);
    },

    /**
     * Has TinyMCE been loaded and the editors been initialised?
     * Designed mainly for IE
     * @return bool
     */
    editorsInitialised : function() {
        return typeof tinyMCE !== 'undefined';
    },

    getEditorIdFromEditorTextareaId : function(id) {
        tests = ['id_'];
        editorId = id.substring(id.indexOf(tests[0]) + tests[0].length, id.length);
        return editorId;
    },

    initialiseEditorToggles : function(refreshes) {
        var Y = this.Y,
            editorsInitialised = this.editorsInitialised(),
            textareas,
            toggleNode,
            editor;

        if (!editorsInitialised && refreshes) {
            setTimeout(function() {
                    M.form_editor.initialiseEditorToggles(refreshes - 1);
                }, 100);
            return;
        }

        // Create the toggle template for use later
        this.toggleNodeTemplate = Y.Node.create('<a class="toggle_editor_toolbar" />');
        this.toggleNodeTemplate.setContent(M.util.get_string('showeditortoolbar', 'form'));

        // Delegate clicks of the toggle_editor_toolbar
        Y.one('body').delegate('click', M.form_editor.toggle_editor_from_event, 'a.toggle_editor_toolbar', this);

        // Set up editors which have already been created
        for (editor in tinyMCE.editors) {
            this.setup_editor(tinyMCE.editors[editor]);
        }

        // Set up for future editors
        // I haven't yet found a way of directly delegating the editor.onInit event. Instead we have to listen for the
        // tinyMCE.onAddEditor event, and then add a further event listener to the editor's onInit event.
        // onAddEditor is triggered before the editor has been created.
        // We use Y.Bind to ensure that context is maintained.
        tinyMCE.onAddEditor.add(Y.bind(this.add_setup_editor_listener, this));
    },

    /**
     * Setup a listener for a new editor which will actually set the editor up
     * @param {Manager} mgr
     * @param {Editor} ed
     */
    add_setup_editor_listener : function (mgr, ed) {
        // Bind the editor.onInit function to set this editor up. This ensures we maintain our context (this)
        ed.onInit.add(Y.bind(this.setup_editor, this));
    },

    /**
     * Setup the toggle system for the provided editor
     *
     * @param {Editor} ed The TinyMCE editor instance
     */
    setup_editor : function(ed) {
        var textarea = Y.Node(ed.getElement()),
            editortable = Y.Node(ed.getContainer).one('> table'),
            thisToggleNode;

        // Does this text area support collapsing at all?
        if (!textarea.hasClass('collapsible')) {
            return;
        }

        // Did we find an appropriate table to work with
        if (!editortable) {
            return;
        }

        // Add toggle button.
        thisToggleNode = this.toggleNodeTemplate.cloneNode(true);
        editortable.get('parentNode').insert(thisToggleNode, editortable);

        // Toggle the toolbars initially.
        if (Y.Node(ed.getElement()).hasClass('collapsed')) {
            this.toggle_editor(thisToggleNode, editortable, 0);
        } else {
            this.toggle_editor(thisToggleNode, editortable, 1);
        }
    },

    /**
     * Toggle the specified editor toolbars
     *
     * @param {Node} button The toggle button which we have to change the text for
     * @param {Node} editortable The table which the tinyMCE editor is in
     * @param {Boolean} newstate The intended toggle state
     */
    toggle_editor : function(button, editortable, newstate) {
        var toolbar = editortable.one('td.mceToolbar').ancestor('tr'),
            statusbar = editortable.one('.mceStatusbar').ancestor('tr'),
            textarea, editor, iframe,
            size;

        // Check whether we have a state already
        if (typeof newstate === 'undefined') {
            if (toolbar.getStyle('display') === 'none') {
                newstate = 1;
            } else {
                newstate = 0;
            }
        }

        // Toggle the various states and update the button text to suit
        if (newstate === 0) {
            toolbar.hide();
            statusbar.hide();
            button.setContent(M.util.get_string('showeditortoolbar', 'form'));
        } else {
            toolbar.show();
            statusbar.show();
            button.setContent(M.util.get_string('hideeditortoolbar', 'form'));
        }

        // Get the tinyMCE editor object for this text area
        textarea = editortable.ancestor('div').one('textarea');
        editor = tinyMCE.getInstanceById(textarea.get('id'));

        // Somehow, this editor did not exist.
        if (!editor) {
            return;
        }

        // Resize editor to correct size style issues.
        // TODO explain why this is required
        iframe = editor.getBody();
        if (iframe) {
            size = tinyMCE.dom.getSize(iframe);

            // If objects exist resize editor.
            if (size) {
                editor.theme.resizeTo(size.w, size.h);
            }
        }
    },

    toggle_editor_from_event : function(thisevent) {
        var button = thisevent.target.ancestor('a', true),
            editortable = thisevent.target.ancestor('span', true).one('table.mceLayout');
        this.toggle_editor(button, editortable);
    }
};
