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
 * @module     moodle-atto_bold-button
 */

/**
 * @namespace M
 * @class atto_bold
 */
M.atto_bold = M.atto_bold || {

    /**
     * Add this button to the form.
     *
     * @method init
     * @param {Object} params
     * @param {string} params.elementid The elementid of the editor this button is to be added to.
     * @param {string} params.group The name of the group this button should be added to.
     */
    init : function(params) {
        var click = function(e, elementid) {
            e.preventDefault();
            if (!M.editor_atto.is_active(elementid)) {
                M.editor_atto.focus(elementid);
            }
            document.execCommand('bold', false, null);
            // Clean the YUI ids from the HTML.
            M.editor_atto.text_updated(elementid);
        };

        var iconurl = M.util.image_url('e/bold', 'core');
        M.editor_atto.add_toolbar_button(params.elementid, 'bold', iconurl, params.group, click);
    }
};
