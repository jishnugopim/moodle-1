YUI.add('moodle-atto_bold-button', function (Y, NAME) {

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
 * Atto text editor bold plugin.
 *
 * @package    editor-atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

function AttoBold() {
    AttoBold.superclass.constructor.apply(this, arguments);
}

Y.namespace('M.atto_bold').Button = Y.extend(AttoBold, Y.M.editor_atto.EditorPlugin, {
    initializer: function() {
        var iconurl = M.util.image_url('e/bold', 'core');
        this.addButton(iconurl, this.bold);
    },

    bold: function(e) {
        e.preventDefault();

        if (this.isActive()) {
            this.focus();
        }

        // Execute the command.
        document.execCommand('bold', false, null);

        // We need to mark the text area as having been updated to process
        // any additional handlers.
        this.markUpdated();
    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
