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
        toggles = Y.all('.mceLayout');
        if (toggles && toggles._nodes[toggles.size() - 1]) {
            node = Y.one(toggles._nodes[toggles.size() - 1]);
            nodeId = node.get('id');
            var toolbarId = '#' + nodeId + ' .mceToolbar';
            var node = Y.one(toolbarId);
            if (node) {
                return true;
            }
        }

        return false;
    },

    getEditorIdFromEditorTextareaId : function(id) {
        tests = ['id_'];
        editorId = id.substring(id.indexOf(tests[0]) + tests[0].length, id.length);
        return editorId;
    },

    initialiseEditorToggles : function(refreshes) {
        Y = this.Y;
        var editorsInitialised = this.editorsInitialised();
        if (!editorsInitialised && refreshes) {
            setTimeout(function() {
                    M.form_editor.initialiseEditorToggles(refreshes - 1);
                }, 100);
            return;
        }

        textareas = Y.all('textarea.collapsible');
        textareas.each(function() {
            textareaNode = Y.one(this);
            nodeId = textareaNode.get('id');
            id = M.form_editor.getEditorIdFromEditorTextareaId(nodeId);
            editorTblNode = Y.one('#id_'+id+'_tbl');

            // Is there a tinymce editor.
            if(!editorTblNode){
                return;
            }

            // Add toggle button
            toggleId = 'id_' + id + '_toggle_toolbar';
            toggleNode = Y.Node.create('<a id="' + toggleId
                    + '" class="toggle_editor_toolbar"></a>');
            toggleNode.setContent(M.util.get_string('showeditortoolbar',
                    'form'));
            parentNode = editorTblNode.get('parentNode');
            parentNode.insert(toggleNode, editorTblNode);

            M.form_editor.toggleEditorToolbars(null, id);
            Y.on('click', M.form_editor.toggleEditorToolbars, '#'
                    + toggleId, {
                name : "context"
            }, id);
        });
    },

    toggleEditorToolbars : function(e, id) {
        var editorId = 'id_' + id;
        var toolbarId = '#' + editorId + '_tbl' + ' .mceToolbar', toggleHandleId = '#id_'
                + id + '_toggle_toolbar', toggleClass = 'hide', langid = 'hideeditortoolbar', editor_bottom_id = '#'
                + editorId + '_tbl tr.mceLast';

        // toggle toolbar
        M.form_editor_display.toggleView(toolbarId);

        // toggle resize and path section
        M.form_editor_display.toggleView(editor_bottom_id);

        // resize editor to correct size style issues
        var ed = tinyMCE.get(editorId);
        var ifr = tinymce.DOM.get(editorId + '_ifr');
        var size = ifr ? tinymce.DOM.getSize(ifr) : null;
        // If objects exist resize editor
        if (ed && size) {
            ed.theme.resizeTo(size.w, size.h);
        }

        // Change toggle handle text
        var toolbarNode = Y.one(toolbarId);
        if (toolbarNode && toolbarNode.getStyle('display') == 'none') {
            langid = 'showeditortoolbar';
        }

        var toggleHandleNode = Y.one(toggleHandleId);
        if (toggleHandleNode) {
            helptext = M.util.get_string(langid, 'form');
            toggleHandleNode.setContent(helptext);
        }
    }
}

/**
 * Handles display related functionality of the editor.
 */
M.form_editor_display = {
    /**
     * Toggle display of the element with the given id
     *
     * @param string id id of the element to toggle
     * @return void
     */
    toggleView : function(id) {
        YUI().use('node', function(Y) {
            var node = Y.one(id);

            if (!node) {
                return false;
            }
            
            node.toggleView();
        })
    },

}
