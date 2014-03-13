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
 * @module moodle-editor_atto-plugin
 * @package    editor_atto
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * An Plugin for the Atto Editor for Moodle.
 *
 * @namespace M.editor_atto
 * @class EditorPlugin
 * @constructor
 */

function EditorPlugin() {
    EditorPlugin.superclass.constructor.apply(this, arguments);
}

var GROUPSELECTOR = '.atto_group.',
    GROUP = '_group';

Y.extend(EditorPlugin, Y.Base, {
    /**
     * The name of the current plugin.
     *
     * @property name
     * @type string
     */
    name: null,

    /**
     * A reference to the parent toolbar.
     *
     * @property toolbar
     * @type Node
     */
    toolbar: null,

    /**
     * A reference to the parent editor.
     *
     * @property toolbar
     * @type Node
     */
    editor: null,

    initializer: function(config) {
        // Set the references.
        this.name = config.name;
        this.toolbar = config.toolbar;
        this.editor = config.editor;

        // Set up the object properties.
        this.buttons = {};
        this.menus = {};
        this._buttonHandlers = [];
        this._menuHideHandlers = [];
    },

    /**
     * Mark the editor as having been changed.
     *
     * @method markUpdated
     */
    markUpdated: function() {
        return this.get('host').updateOriginal();
    }
}, {
    NAME: 'editorPlugin',
    ATTRS: {
        /**
         * The editor instance hosting this plugin instance.
         *
         * @attribute host
         * @type M.editor_atto.editor
         * @writeOnce
         */
        host: {
            writeOnce: true
        },

        /**
         * The group that this button belongs to.
         *
         * When setting, the name of the group should be specified.
         * When retrieving, the Node for the toolbar group is returned. If
         * the group doesn't exist yet, then it is created first.
         *
         * @attribute group
         * @type Node
         * @writeOnce
         */
        group: {
            writeOnce: true,
            getter: function(groupName) {
                var group = this.toolbar.one(GROUPSELECTOR + groupName + GROUP);
                if (!group) {
                    group = Y.Node.create('<div class="atto_group ' +
                            groupName + GROUP + '"></div>');
                    this.toolbar.append(group);
                }

                return group;
            }
        }
    }
});

Y.namespace('M.editor_atto').EditorPlugin = EditorPlugin;
