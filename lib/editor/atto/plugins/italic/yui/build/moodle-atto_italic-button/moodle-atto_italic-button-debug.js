YUI.add('moodle-atto_italic-button', function (Y, NAME) {

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
 * Atto text editor italic plugin.
 *
 * @package    editor-atto
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
function AttoItalic() {
    AttoItalic.superclass.constructor.apply(this, arguments);
}

Y.namespace('M.atto_italic').Button = Y.extend(AttoItalic, Y.M.editor_atto.EditorPlugin, {
    initializer: function() {
        this.addBasicButton({
            exec: 'italic'
        });
    }
});


}, '@VERSION@', {"requires": ["node"]});
