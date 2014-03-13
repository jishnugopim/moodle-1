YUI.add('moodle-atto_html-button', function (Y, NAME) {

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

/*
 * Atto text editor html plugin.
 *
 * @module     moodle-atto_html-button
 * @package    editor-atto
 * @copyright  2014 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Atto text editor html plugin.
 *
 * @namespace M.atto_html
 * @class button
 */

Y.namespace('M.atto_html').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    initializer: function() {
        this.addButton({
            icon: 'e/source_code',
            callback: this.toggleHTML
        });
    },
    toggleHTML: function() {
        // Toggle the HTML status.
        this.set('isHTML', !this.get('isHTML'));

        // Now make the UI changes.
        this._showHTML();
    },
    _showHTML: function() {
        var host = this.get('host');
        if (this.get('isHTML')) {
            // Enable all plugins.
            host.enablePlugins();

            // Copy the text to the contenteditable div.
            host.updateFromTextArea();

            // Hide the textarea, and show the editor.
            host.textarea.hide();
            this.editor.show();

            // Focus on the editor.
            host.focus();

            // And re-mark everything as updated.
            this.markUpdated();
        } else {
            // Disable all plugins.
            host.disablePlugins();

            // And then re-enable this one.
            host.enablePlugins(this.name);

            // Copy the text to the contenteditable div.
            host.updateOriginal();

            // Hide the editor, and show the textarea.
            this.editor.hide();
            host.textarea.show();

            // Focus on the textarea.
            host.textarea.focus();
        }
    }
}, {
    ATTRS: {
        isHTML: {
            value: true
        }
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin", "event-valuechange"]});
