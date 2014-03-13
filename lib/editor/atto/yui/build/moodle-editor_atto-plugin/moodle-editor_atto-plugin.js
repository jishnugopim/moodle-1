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
    GROUP = '_group',
    DISABLED = 'disabled',
    HIGHLIGHT = 'highlight',
    LOGNAME = 'moodle-editor_atto-editor-plugin',
    CSSEDITORWRAPPER = '.editor_atto_content';

Y.extend(EditorPlugin, Y.Base, {
    /**
     * The buttons belonging to this plugin instance.
     *
     * @property buttons
     * @type object
     */
    buttons: null,

    /**
     * The list of Event Handlers for buttons.
     *
     * @property _buttonHandlers
     * @private
     * @type array
     */
    _buttonHandlers: null,

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
        this._buttonHandlers = [];
    },

    /**
     * Add a button for this plugin to the toolbar.
     *
     * @method addButton
     * @param {object} config The configuration for this button
     * @param {string} [config.iconurl] The URL for the icon. If not specified, then the icon and component will be used instead.
     * @param {string} [config.icon] The icon identifier.
     * @param {string} [config.iconComponent='core'] The icon component.
     * @param {string} [config.keys] The shortcut key that can call this plugin from the keyboard.
     * @param {string} [config.tags] The tags that trigger this button to be highlighted.
     * @param {string} [config.title=this.name] The string identifier in the plugin's language file.
     * @param {string} [config.buttonName=this.name] The name of the button. This is used in the buttons object, and if
     * specified, in the class for the button.
     * @param {function} config.callback A callback function to call when the button is clicked.
     * @param {object} [config.callbackArgs] Any arguments to pass to the callback.
     * @param {boolean} [config.wrapCallback=true] Whether to wrap the callback in default functionality.
     * @return Node The Node representing the newly created button.
     */
    addButton: function(config) {
        var group = this.get('group'),
            pluginname = this.name,
            buttonClass = 'atto_' + pluginname + '_button',
            button,
            host = this.get('host');

        if (config.exec) {
            buttonClass = buttonClass + '_' + config.exec;
        }

        if (!config.buttonName) {
            // Set a default button name - this is used as an identifier in the button object.
            config.buttonName = pluginname;
        } else {
            buttonClass = buttonClass + '_' + config.buttonName;
        }

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

        // Create the actual button.
        button = Y.Node.create('<button class="' + buttonClass + '"' +
                'tabindex="-1">' +
                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + config.iconurl + '"/>' +
                '</button>');
        button.setAttribute('title', title);

        // Append it to the group.
        group.append(button);

        var currentfocus = this.toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            this.toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // By default, we wrap the callback in function to prevent the default action, check whether the editor is
        // active and focus it, and then mark the field as updated.
        if (typeof config.wrapCallback === 'undefined') {
            config.wrapCallback = true;
        }

        var callback;
        if (config.wrapCallback) {
            callback = Y.rbind(this._callbackWrapper, this, config.callback, config.callbackArgs);
        } else {
            callback = config.callback;
        }

        // Add the standard click handler to the button.
        this._buttonHandlers.push(
            this.toolbar.delegate('click', callback, '.' + buttonClass, this)
        );

        // Handle button click via shortcut key.
        if (config.keys) {
            this.addKeyboardListener(callback, config.keys, buttonClass);
        }

        // Handle highlighting of the button.
        if (config.tags) {
            this._buttonHandlers.push(
                host.on('atto:selectionchanged', function(e) {
                    if (host.selectionFilterMatches(config.tags, e.selectedNodes)) {
                        this.highlightButton(config.buttonName);
                    } else {
                        this.unHighlightButton(config.buttonName);
                    }
                }, this)
            );
        }

        // Add the button reference to the buttons array for later reference.
        this.buttons[config.buttonName] = button;
        return button;
    },

    /**
     * Add a basic button which ties into the execCommand.
     *
     * See {{#crossLink "EditorPlugin#addButton"}}addButton{{/crossLink}} for full details of the optional parameters.
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
            return null;
        }

        // The default icon - true for most core plugins.
        if (!config.icon) {
            config.icon = 'e/' + config.exec;
        }

        // The default callback.
        config.callback = function() {
            document.execCommand(config.exec, false, null);

            // Fire an event that the plugin can listen to again.
            this.fire(config.exec + ':complete');
        };

        // Return the newly created button.
        return this.addButton(config);
    },

    /**
     * A wrapper in which to run the callbacks.
     *
     * This handles common functionality such as:
     * <ul>
     *  <li>preventing the default action;</li>
     *  <li>focusing the editor if relevant; and</li>
     *  <li>marking the editor as updated following the change.</li>
     * </ul>
     *
     * @method _callbackWrapper
     * @param {EventFacade} e
     * @param {Function} callback The function to call which makes the relevant changes.
     * @param {Array} [callbackArgs] The arguments passed to this callback.
     * @private
     */
    _callbackWrapper: function(e, callback, callbackArgs) {
        e.preventDefault();

        if (this.get('host').isActive()) {
            this.get('host').focus();
        }

        // Build the arguments list, but remove the callback we're calling.
        var args = [e, callbackArgs];

        // Actually call the callback now.
        callback.apply(this, args);

        // And mark the text area as updated.
        this.markUpdated();
    },

    addKeyboardListener: function(callback, keyConfig, buttonName) {
        var eventtype = 'key',
            container = CSSEDITORWRAPPER,
            keys;

        if (Y.Lang.isArray(keyConfig)) {
            // If an Array was specified, call the add function for each element.
            Y.Array.each(keyConfig, function(config) {
                this.addKeyboardListener(callback, config);
            }, this);

            return this;

        } else if (typeof keyConfig === "object") {
            if (keyConfig.eventtype) {
                eventtype = keyConfig.eventtype;
            }

            if (keyConfig.container) {
                container = keyConfig.container;
            }

            // Must be specified.
            keys = keyConfig.keyCodes;

        } else {
            keys = this.getKeyEvent() + keyConfig + this.getDefaultMetaKey();

        }

        this._buttonHandlers.push(
            this.editor.delegate(
                eventtype,
                callback,
                keys,
                container,
                this
            )
        );

    },

    /**
     * Determine if the specified toolbar button/menu is enabled.
     *
     * @method isEnabled
     * @return boolean
     */
    isEnabled: function() {
        // The first instance of an undisabled button will make this return true.
        var found = Y.Object.some(this.buttons, function() {
            return (!this.hasAttribute(DISABLED) ||
                    this.getAttribute(DISABLED) !== "true");
        });

        return found;
    },

    /**
     * Enable one button, or all buttons relating to this Plugin.
     *
     * @method disableButtons
     * @param {String} [button] The name of a specific plugin to enable.
     * @chainable
     */
    disableButtons: function() {
        return this._setButtonState(false, button);
    },

    /**
     * Enable one button, or all buttons relating to this Plugin.
     *
     * @method enableButtons
     * @param {String} [button] The name of a specific plugin to enable.
     * @chainable
     */
    enableButtons: function(button) {
        return this._setButtonState(true, button);
    },

    /**
     * Set the button state for one button, or all buttons associated with
     * this plugin.
     *
     * @method _setButtonState
     * @param {Boolean} enable Whether to enable this button.
     * @param {String} [button] The name of a specific plugin to set state for.
     * @chainable
     * @private
     */
    _setButtonState: function(enable, button) {
        var attributeChange = 'addAttribute';
        if (enable) {
            attributeChange = 'removeAttribute';
        }
        if (button) {
            if (this.buttons[button]) {
                this.buttons[button][attributeChange](DISABLED);
            }
        } else {
            Y.Object.each(this.buttons, function() {
                this[attributeChange](DISABLED);
            });
        }

        return this;
    },

    /**
     * Highlight a button, or buttons in the toolbar.
     *
     * @method highlightButton
     * @param {string} [button] If a plugin has multiple buttons, the specific button to highlight.
     */
    highlightButton: function(button) {
        this._changeButtonHighlight(true, button);
    },

    /**
     * Un-highlgiht a button, or buttons in the toolbar.
     *
     * @method unHighlightButton
     * @param {string} [button] If a plugin has multiple buttons, the specific button to highlight.
     */
    unHighlightButton: function(button) {
        this._changeButtonHighlight(false, button);
    },

    /**
     * Highlight a button, or buttons in the toolbar.
     *
     * @method _changeButtonHighlight
     * @param {boolean} highlight true
     * @param {string} [button] If a plugin has multiple buttons, the specific button to highlight.
     * @protected
     */
    _changeButtonHighlight: function(highlight, button) {
        var method = 'addClass';
        if (!highlight) {
            method = 'removeClass';
        }
        if (button) {
            if (this.buttons[button]) {
                this.buttons[button][method](HIGHLIGHT);
            }
        } else {
            Y.Object.each(this.buttons, function() {
                this[method](HIGHLIGHT);
            });
        }
    },

    /**
     * Returns the default meta key to use with a shortcut.
     *
     * @method getDefaultMetaKey
     * @return {string}
     */
    getDefaultMetaKey: function() {
        if (Y.UA.os === 'macintosh') {
            return '+meta';
        } else {
            return '+ctrl';
        }
    },

    /**
     * Returns the key event to use for this shortcut.
     * @return {string}
     */
    getKeyEvent: function() {
        return 'down:';
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
/**
 * @module moodle-editor_atto-editor-plugin
 */

function EditorPluginDialogue() {}

EditorPluginDialogue.ATTRS= {
};

EditorPluginDialogue.prototype = {
    /**
     * A reference to the instantiated dialogue.
     *
     * @property _dialogue
     * @private
     * @type M.core.Dialogue
     */
    _dialogue: null,

    /**
     * Fetch the instantiated dialogue. If a dialogue has not yet been created,
     * instantiate one.
     */
    getDialogue: function(config) {
        if (!this._dialogue) {
            // Merge the default configuration with any provided configuration.
            var dialogueConfig = Y.merge({
                    visible: false,
                    modal: true,
                    close: true,
                    draggable: true
                }, config);

            // Instantiate the dialogue.
            this._dialogue = new M.core.dialogue(dialogueConfig);
        }
        return this._dialogue;
    }
};

Y.Base.mix(Y.M.editor_atto.EditorPlugin, [EditorPluginDialogue]);


}, '@VERSION@', {"requires": ["node", "base", "escape", "event", "moodle-core-handlebars"]});
