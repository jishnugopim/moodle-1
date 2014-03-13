var MENUTEMPLATE = '' +
        '<button class="{{buttonClass}} atto_hasmenu" ' +
            'tabindex="-1" ' +
            'type="button" ' +
            'title="{{config.title}}">' +
            '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" '+
                'style="background-color:{{config.menuColor}};" src="{{config.iconurl}}" />' +
            '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="{{image_url "t/expanded" "moodle"}}"/>' +
        '</button>',
    MENUDIALOGUE = '' +
        '<div class="{{config.buttonClass}} atto_menu" ' +
            'style="min-width:{{config.innerOverlayWidth}};">' +
            '{{#each config.items}}' +
                '<div tabindex="-1" class="atto_menuentry">' +
                    '<a href="#" data-index="{{@index}}" data-handler="{{../config.buttonClass}}_action_{{@index}}">' +
                        '{{{text}}}' +
                    '</a>' +
                '</div>' +
            '{{/each}}' +
        '</div>';

var DISABLED = 'disabled',
    HIGHLIGHT = 'highlight',
    LOGNAME = 'moodle-editor_atto-editor-plugin',
    CSSEDITORWRAPPER = '.editor_atto_content';

function EditorPluginButtons() {}

EditorPluginButtons.ATTRS= {
};

EditorPluginButtons.prototype = {

    /**
     * The buttons belonging to this plugin instance.
     *
     * @property buttons
     * @type object
     */
    buttons: null,

    /**
     * The menus belonging to this plugin instance.
     *
     * @property menus
     * @type object
     */
    menus: null,

    /**
     * The list of Event Handlers for buttons.
     *
     * @property _buttonHandlers
     * @private
     * @type array
     */
    _buttonHandlers: null,

    /**
     * Hide handlers which are cancelled when the menu is hidden.
     *
     * @property _menuHideHandlers
     * @private
     * @type array
     */
    _menuHideHandlers: null,

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

        // Normalize icon configuration.
        config = this._normalizeIcon(config);

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

        // Normalize the callback parameters.
        config = this._normalizeCallback(config);

        // Add the standard click handler to the button.
        this._buttonHandlers.push(
            this.toolbar.delegate('click', config.callback, '.' + buttonClass, this)
        );

        // Handle button click via shortcut key.
        if (config.keys) {
            this.addKeyboardListener(config.callback, config.keys, buttonClass);
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
            Y.log('No exec command specified. Cannot proceed.',
                    'warn', 'moodle-editor_atto-plugin');
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

            // And mark the text area as updated.
            this.markUpdated();
        };

        // Return the newly created button.
        return this.addButton(config);
    },

    /**
     * Add a button to the toolbar belonging to the editor for element with id "elementid".
     * @param string elementid - the id of the textarea we created this editor from.
     * @param string plugin - the plugin defining the button
     * @param string icon - the html used for the content of the button
     * @param string groupname - the group the button should be appended to.
     * @param array entries - List of menu entries with the string (entry.text) and the handlers (entry.handler).
     * @param string buttonname - (optional) a name for the button. Required if a plugin creates more than one button.
     * @param string buttontitle - (optional) a title for the button. Required if a plugin creates more than one button.
     * @param int overlaywidth - the overlay width size in 'ems'.
     * @param string menucolor - menu icon background color
     */
    addToolbarMenu : function(config) {
        var group = this.get('group'),
            pluginname = this.name,
            buttonClass = 'atto_' + pluginname + '_button',
            button,
            currentFocus;

        if (!config.buttonName) {
            // Set a default button name - this is used as an identifier in the button object.
            config.buttonName = pluginname;
        } else {
            buttonClass = buttonClass + '_' + config.buttonName;
        }

        // Normalize icon configuration.
        config = this._normalizeIcon(config);

        if (!config.title) {
            config.title = 'pluginname';
        }
        var title = M.util.get_string(config.title, 'atto_' + pluginname);

        if (!config.menuColor) {
            config.menuColor = 'transparent';
        }

        // Create the actual button.
        var template = Y.Handlebars.compile(MENUTEMPLATE);
        button = Y.Node.create(template({
            buttonClass: buttonClass,
            config: config,
            title: title
        }));

        // Append it to the group.
        group.append(button);

        currentFocus = this.toolbar.getAttribute('aria-activedescendant');
        if (!currentFocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            this.toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // Add the standard click handler to the menu.
        this._buttonHandlers.push(
            this.toolbar.delegate('click', this._showToolbarMenu, '.' + buttonClass, this, config)
        );

        // Add the button reference to the buttons array for later reference.
        this.buttons[config.buttonName] = button;
    },

    /**
     * Display a toolbar menu.
     *
     * @method _showToolbarMenu
     * @param {EventFacade} e
     * @param {object} config The configuration for the whole toolbar.
     * @param {Number} [config.overlayWidth=14] The width of the menu
     */
    _showToolbarMenu: function(e, config) {
        if (!this.menus[config.buttonClass]) {
            if (!config.overlayWidth) {
                config.overlayWidth = '14';
            }

            if (!config.innerOverlayWidth) {
                config.innerOverlayWidth = parseInt(config.overlayWidth, 10) - 2 + 'em';
            }
            config.overlayWidth = parseInt(config.overlayWidth, 10) - 2 + 'em';

            // Create the actual button.
            var template = Y.Handlebars.compile(MENUDIALOGUE),
                menu = Y.Node.create(template({
                    config: config
                }));

            this._buttonHandlers.push(
                menu.delegate('click', this._chooseMenuItem, '.atto_menuentry a', this),
                menu.delegate('key', this._chooseMenuItem, '32, enter', '.atto_menuentry', this)
            );

            // Create the dialogue.
            this.menus[config.buttonClass] = new M.core.dialogue({
                bodyContent: menu,
                width: config.overlayWidth,
                visible: false,
                center: false,
                closeButton: false
            });

            // Hide the header node entirely.
            this.menus[config.buttonClass].headerNode.hide();
        }

        var menuDialogue = this.menus[config.buttonClass];

        // Focus on the button by default after hiding this menu.
        menuDialogue.set('focusAfterHide', this.buttons[config.buttonName]);

        // Display the menu.
        menuDialogue.show();

        // Position it next to the button which opened it.
        menuDialogue.align(this.buttons[config.buttonName], [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);

        // And focus on the first element in the menu.
        menuDialogue.get('boundingBox').one('a').focus();

        // Hide the menu when clicking outside of it.
        this._menuHideHandlers.push(
            menuDialogue.get('boundingBox').on('focusoutside', this._hideMenu, this, menuDialogue)
        );
    },

    /**
     * Show a menu.
     *
     * TODO - is this used? Am I dense.
     *
     * @method _showMenu
     * @param {EventFacade} e
     * @param {object} config The whole button configuration object.
     * @private
     */
    _showMenu: function() {
        // Set the tabindex.
        if (currentid) {
            current = Y.one('#' + currentid);
            // We only ever want one button with a tabindex of 0 at any one time.
            current.setAttribute('tabindex', '-1');
        }
        this.setAttribute('tabindex', 0);
        // And update the activedescendant to point at the currently selected button.
        toolbar.setAttribute('aria-activedescendant', this.generateID());

    },

    /**
     * Hide a menu, removing all of the event handlers which trigger the
     * hide.
     *
     * @method _hideMenu
     * @param {EventFacade} e
     * @param {M.core.dialogue} menuDialogue The Dialogue to hide.
     * @private
     */
    _hideMenu: function(e, menuDialogue) {
        menuDialogue.hide();
        new Y.EventHandle(this._menuHideHandlers).detach();
    },

    /**
     * Select a menu item and call the appropriate callbacks.
     *
     * @method _chooseMenuItem
     * @param {EventFacade} e
     * @param {object} config
     * @private
     */
    _chooseMenuItem: function(e, config) {
        // Get the index from the clicked anchor.
        var index = e.currentTarget.ancestor('a', true).getData('index'),

            // And the normalized callback configuration.
            buttonConfig = this._normalizeCallback(config.items[index], config.globalItemConfig);

        // Call the callback for this button.
        buttonConfig.callback.apply(this, arguments);
    },

    _showHideMenu: function(e) {
        e.preventDefault();
        var disabled = this.getAttribute('disabled');
        var overlayid = this.getAttribute('data-menu');
        var overlay = M.editor_atto.menus[overlayid];
        var menu = overlay.get('bodyContent');
        if (overlay.get('visible') || disabled) {
            overlay.hide();
            menu.detach('clickoutside');
        } else {
            menu.on('clickoutside', function(ev) {
                if ((ev.target.ancestor() !== this) && (ev.target !== this)) {
                    if (overlay.get('visible')) {
                        menu.detach('clickoutside');
                        overlay.hide();
                    }
                }
            }, this);

            overlay.align(Y.one(Y.config.doc.body), [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
            overlay.show();
            var icon = e.target.ancestor('button', true).one('img');
            overlay.align(icon, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
            overlay.get('boundingBox').one('a').focus();
        }
    },


    /**
     * Normalize and sanitize the configuration variables relating to
     * callbacks.
     *
     * @method _normalizeCallback
     * @param {object} config
     * @param {function} config.callback A callback function to call when the button is clicked.
     * @param {object} [config.callbackArgs] Any arguments to pass to the callback.
     * @param {boolean} [config.wrapCallback=true] Whether to wrap the callback in default functionality.
     * @param {object} [inheritFrom] A parent configuration that this configuration may inherit from.
     * @return {object} The normalized configuration
     * @private
     */
    _normalizeCallback: function(config, inheritFrom) {
        if (!inheritFrom) {
            // Create an empty inheritFrom to make life easier below.
            inheritFrom = {};
        }

        // By default, we wrap the callback in function to prevent the default action, check whether the editor is
        // active and focus it, and then mark the field as updated.
        if (typeof config.wrapCallback === 'undefined') {
            config.wrapCallback = inheritFrom.wrapCallback || true;
        }

        if (config.wrapCallback) {
            config._callback = inheritFrom.callback || config.callback;
            config.callback = Y.rbind(this._callbackWrapper, this, config._callback, config.callbackArgs);
        } else {
            config.callback = inheritFrom.callback || config.callback;
        }

        return config;
    },

    /**
     * Normalize and sanitize the configuratino varaibels relating to icons.
     *
     * @method _normalizeIcon
     * @param {object} config
     * @param {string} [config.iconurl] The URL for the icon. If not specified, then the icon and component will be used instead.
     * @param {string} [config.icon] The icon identifier.
     * @param {string} [config.iconComponent='core'] The icon component.
     * @return {object} The normalized configuration
     * @private
     */
    _normalizeIcon: function(config) {
        if (!config.iconurl) {
            // The default icon component.
            if (!config.iconComponent) {
                config.iconComponent = 'core';
            }
            config.iconurl = M.util.image_url(config.icon, config.iconComponent);
        }
        
        return config;
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

        Y.log('Atto shortcut registered: ' + keys + ' now triggers for ' + buttonName,
                'debug', LOGNAME);
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
    }
};

Y.Base.mix(Y.M.editor_atto.EditorPlugin, [EditorPluginButtons]);
