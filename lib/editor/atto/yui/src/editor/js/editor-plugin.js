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

var GROUPSELECTOR = '.atto_group.',
    GROUP = '_group';

Y.extend(EditorPlugin, Y.Base, {
    /**
     * The list of Event Handlers for buttons.
     *
     * @property _buttonHandlers
     * @private
     * @type array
     */
    _buttonHandlers: [],

    editor: null,
    toolbar: null,
    name: null,

    initializer: function(config) {
        this.editor = config.editor;
        this.toolbar = config.toolbar;
        this.name = config.name;
    },

    /**
     * Add a button for this plugin to the toolbar.
     *
     * @method addButton
     * @param {string} iconurl the url to the image for the icon.
     * @param {function} callback A callback function to call when the button is clicked.
     * @return Node The Node representing the newly created button.
     */
    addButton: function(iconurl, callback) {
        var group = this.get('group'),
            name = this.name,
            buttonClass = 'atto_' + name + '_button';

        var button = Y.Node.create('<button class="' + buttonClass + '"' +
                               'tabindex="-1" ' +
                               'title="' + Y.Escape.html(M.util.get_string('pluginname', 'atto_' + name)) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + iconurl + '"/>' +
                               '</button>');

        group.append(button);

        var currentfocus = this.toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            this.toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // We only need to attach this once.
        this._buttonHandlers.push(
            this.toolbar.delegate('click', callback, '.' + buttonClass, this)
        );

        return button;
    },

    isActive: function() {
        return this.get('host').isActive();
    },

    focus: function() {
        return this.get('host').focus();
    },

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
         * @writeOnce
         */
        host: {
            writeOnce: true
        },

        /**
         * The group that this button belongs to.
         *
         * @attribute group
         * @writeOnce
         */
        group: {
            writeOnce: true,
            getter: function(groupName) {
                var toolbar = this.toolbar,
                    group = toolbar.one(GROUPSELECTOR + groupName + GROUP);
                if (!group) {
                    group = Y.Node.create('<div class="atto_group ' +
                            groupName + GROUP + '"></div>');
                    toolbar.append(group);
                }

                return group;
            }
        }
    }
});

Y.namespace('M.editor_atto').EditorPlugin = EditorPlugin;
