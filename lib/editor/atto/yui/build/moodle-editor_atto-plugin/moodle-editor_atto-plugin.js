YUI.add('moodle-editor_atto-plugin', function (Y, NAME) {

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
     * @param {object} config The configuration for this button
     * @param {string} config.iconurl the url to the image for the icon.
     * @param {function} config.callback A callback function to call when the button is clicked.
     * @return Node The Node representing the newly created button.
     */
    addButton: function(config) {
        var group = this.get('group'),
            name = this.name,
            buttonClass = 'atto_' + name + '_button';

        var button = Y.Node.create('<button class="' + buttonClass + '"' +
                               'tabindex="-1" ' +
                               'title="' + Y.Escape.html(M.util.get_string('pluginname', 'atto_' + name)) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + config.icon + '"/>' +
                               '</button>');

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

        // Attempt to add any sub buttons.
        this._addSubButtons(button, config);

        this.buttons.push(button);
        return button;
    },

    _addSubButtons: function(button, config) {
        if (!config.entries || config.entries.length === 0) {
            return;
        }
        // Handle sub-buttons.
        // Temporary til we rewrite buttonclicked_handler
        var host = this.get('host');
        var entries = config.entries || [],
            i = 0,
            entry,
            entryButtonClass;
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            entryButtonClass = '.atto_' + name + '_action_' + i;

            menu.append(Y.Node.create('<div class="atto_menuentry">' +
                                       '<a href="#" class="' + entryButtonClass + '" ' +
                                       entry.text +
                                       '</a>' +
                                       '</div>'));

            this._buttonHandlers.push(
                this.toolbar.delegate('click', host.buttonclicked_handler, entryButtonClass),
                this.toolbar.delegate('key', host.buttonclicked_handler, 'space,enter', entryButtonClass)
            );
        }

        this._buttonHandlers.push(
            this.toolbar.delegate('click', host.showhide_menu_handler, '.' + buttonClass, this)
        );
        /*

        var overlay = new M.core.dialogue({
            bodyContent : menu,
            visible : false,
            width: overlaywidth + 'em',
            lightbox: false,
            closeButton: false,
            center : false
        });

        M.editor_atto.menus[plugin + '_' + elementid] = overlay;
        overlay.align(button, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
        overlay.hide();
        overlay.headerNode.hide();
        overlay.render();

        */

    },

    addBasicButton: function(config) {
        // The default icon - true for most core plugins.
        if (!config.icon) {
            config.icon = 'e/' + config.exec;
        }

        // The default icon component.
        if (!config.iconComponent) {
            config.iconComponent = 'core';
        }

        return this.addButton({
            icon: M.util.image_url(config.icon, config.iconComponent),
            callback: function(e) {
                e.preventDefault();

                if (this.isActive()) {
                    this.focus();
                }

                document.execCommand(config.exec, false, null);

                this.markUpdated();
            }
        });
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


}, '@VERSION@', {"requires": ["node", "base", "escape", "event"]});
