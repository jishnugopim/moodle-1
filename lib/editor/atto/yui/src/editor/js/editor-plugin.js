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
     * The buttons belonging to this plugin instance.
     *
     * @property buttons
     * @type array
     */
    buttons: [],

    /**
     * The list of Event Handlers for buttons.
     *
     * @property _buttonHandlers
     * @private
     * @type array
     */
    _buttonHandlers: [],

    /**
     * A reference to the content editable area.
     *
     * @property editor
     * @type Node
     */
    editor: null,

    /**
     * A reference to the toolbar.
     *
     * @property toolbar
     * @type Node
     */
    toolbar: null,

    /**
     * The name of the current plugin.
     *
     * @property name
     * @type string
     */
    name: null,

    initializer: function(config) {
        // Set the references.
        this.editor  = config.editor;
        this.toolbar = config.toolbar;
        this.name    = config.name;
    },

    /**
     * Add a button for this plugin to the toolbar.
     *
     * @method addButton
     * @param {object} config The configuration for this button
     * @param {string} [config.iconurl] The URL for the icon. If not specified, then the icon and component will be used instead.
     * @param {string} [config.icon] The icon identifier.
     * @param {string} [config.iconComponent='core'] The icon component.
     * @param {function} config.callback A callback function to call when the button is clicked.
     * @return Node The Node representing the newly created button.
     */
    addButton: function(config) {
        var group = this.get('group'),
            pluginname = this.name,
            buttonClass = 'atto_' + pluginname + '_button',
            button;


        if (!config.iconurl) {
            // The default icon component.
            if (!config.iconComponent) {
                config.iconComponent = 'core';
            }
            config.iconurl = M.util.image_url(config.icon, config.iconComponent);
        }

        if (!config.title) {
            config.title = 'pluginname';
        }
        var title = M.util.get_string(config.title, 'atto_' + pluginname);


        button = Y.Node.create('<button class="' + buttonClass + '"' +
                'tabindex="-1">' +
                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + config.iconurl + '"/>' +
                '</button>');
        button.setAttribute('title', title);

        group.append(button);

        var currentfocus = this.toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            this.toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        this._buttonHandlers.push(
            this.toolbar.delegate('click', config.callback, '.' + buttonClass, this)
        );

        this.buttons.push(button);
        return button;
    },

    /**
     * Add a basic button which ties into the execCommand.
     *
     * @method addBasicButton
     * @param {object} config The button configuration
     * @param {string} config.exec The execCommand to call on the document.
     * @param {string} [config.iconurl] The URL for the icon. If not specified, then the icon and component will be used instead.
     * @param {string} [config.icon='e/'+config.exec] The icon identifier.
     * @param {string} [config.iconComponent='core'] The icon component.
     * @return Node The Node representing the newly created button, or null if it could not be created.
     */
    addBasicButton: function(config) {
        if (!config.exec) {
            Y.log('No exec command specified. Cannot proceed.',
                    'warn', 'moodle-editor_atto-plugin');
            return null;
        }

        // The default icon - true for most core plugins.
        if (!config.icon) {
            config.icon = 'e/' + config.exec;
        }

        // The default callback.
        config.callback = function(e) {
                e.preventDefault();

                if (this.isActive()) {
                    this.focus();
                }

                document.execCommand(config.exec, false, null);

                this.markUpdated();
            };

        // Return the newly created button.
        return this.addButton(config);
    },

    /**
     * Determine if the specified toolbar button/menu is enabled.
     *
     * @method isEnabled
     * @return boolean
     */
    isEnabled: function() {
        var found = Y.Array.find(this.buttons, function() {
            return (this.hasAttribute('disabled') &&
                    this.getAttribute('disabled') === "true");
        });

        if (found) {
            return true;
        }

        return false;
    },

    /**
     * Disable all buttons relating to this Plugin.
     *
     * @method disableButtons
     * @chainable
     */
    disableButtons: function() {
        Y.Array.each(this.buttons, function() {
            this.setAttribute('disabled', true);
        });

        return this;
    },

    /**
     * Enable all buttons relating to this Plugin.
     *
     * @method enableButtons
     * @chainable
     */
    enableButtons: function() {
        Y.Array.each(this.buttons, function() {
            this.removeAttribute('disabled');
        });

        return this;
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
