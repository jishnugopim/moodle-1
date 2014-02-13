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
 * Atto editor plugin.
 *
 * @module moodle-editor_atto-editor-plugin
 * @package    editor_atto
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Atto Editor Plugin.
 *
 * @class Y.m.editor_atto.EditorPlugin
 * @constructor
 */

function EditorPlugin() {
    EditorPlugin.superclass.constructor.apply(this, arguments);
}

Y.extend(EditorPlugin, Y.Base, {
}, {
    NAME: 'editorPlugin',
    ATTRS: {
        host: {
            writeOnce: true
        }
    }
});

Y.namespace('M.editor_atto').EditorPlugin = EditorPlugin;
