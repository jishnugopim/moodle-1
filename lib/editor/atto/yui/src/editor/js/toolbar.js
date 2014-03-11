// Add in the functionality.
Y.mix(M.editor_atto, {
    /**
     * List of attached button handlers to prevent duplicates.
     */
    buttonhandlers : {},

    /**
     * List of YUI overlays for custom menus.
     */
    menus : {},

    /**
     * List of attached menu handlers to prevent duplicates.
     */
    menuhandlers : {},

    /**
     * List of buttons and menus that have been added to the toolbar.
     */
    widgets : {},

    /**
     * Toggle a menu.
     * @param event e
     */
    showhide_menu_handler : function(e) {
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
     * Handle clicks on editor buttons.
     * @param event e
     */
    buttonclicked_handler : function(e) {
        var elementid = this.getAttribute('data-editor');
        var plugin = this.getAttribute('data-plugin');
        var button = this.getAttribute('data-button');
        var handler = this.getAttribute('data-handler');
        var overlay = M.editor_atto.menus[plugin + '_' + elementid];
        var toolbar = M.editor_atto.get_toolbar_node(elementid);
        var currentid = toolbar.getAttribute('aria-activedescendant');

        // Right now, currentid is the id of the previously selected button.
        if (currentid) {
            current = Y.one('#' + currentid);
            // We only ever want one button with a tabindex of 0 at any one time.
            current.setAttribute('tabindex', '-1');
        }
        this.setAttribute('tabindex', 0);
        // And update the activedescendant to point at the currently selected button.
        toolbar.setAttribute('aria-activedescendant', this.generateID());

        if (overlay) {
            overlay.hide();
        }

        if (M.editor_atto.is_enabled(elementid, plugin, button)) {
            // Pass it on.
            handler = M.editor_atto.buttonhandlers[handler];
            return handler(e, elementid);
        }
    },

    /**
     * Disable all buttons and menus in the toolbar.
     * @param string elementid, the element id of this editor.
     */
    disable_all_widgets : function(elementid) {
        var plugin, element, toolbar = M.editor_atto.get_toolbar_node(elementid);
        for (plugin in M.editor_atto.widgets) {
            element = toolbar.one('.atto_' + plugin + '_button');

            if (element) {
                element.setAttribute('disabled', 'true');
            }
        }
    },

    /**
     * Get the node of the toolbar container for this editor.
     *
     * @param string elementid, the element id of this editor.
     * @return Y.Node
     */
    get_toolbar_node : function(elementid) {
        // Note - it is not safe to use a CSS selector like '#' + elementid
        // because the id may have colons in it - e.g. quiz.
        return Y.one(document.getElementById(elementid + '_toolbar'));
    },

    /**
     * Determine if the specified toolbar button/menu is enabled.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the plugin that created the button/menu.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    is_enabled : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        return !element.hasAttribute('disabled');
    },

    /**
     * Determine if the specified toolbar button/menu is highlighted.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the plugin that created the button/menu.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    is_highlighted : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        return !element.hasClass(CSS.HIGHLIGHT);
    },

    /**
     * Enable a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    enable_widget : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.removeAttribute('disabled');
        }
    },

    /**
     * Highlight a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    add_widget_highlight : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.addClass(CSS.HIGHLIGHT);
        }
    },

    /**
     * Unhighlight a single widget in the toolbar.
     * @param string elementid, the element id of this editor.
     * @param string plugin, the name of the plugin that created the widget.
     * @param string buttonname, optional - used when a plugin has multiple buttons.
     */
    remove_widget_highlight : function(elementid, plugin, button) {
        var buttonpath = plugin;
        if (button) {
            buttonpath += '_' + button;
        }
        var element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + buttonpath + '_button');

        if (element) {
            element.removeClass(CSS.HIGHLIGHT);
        }
    },

    /**
     * Enable all buttons and menus in the toolbar.
     * @param string elementid, the element id of this editor.
     */
    enable_all_widgets : function(elementid) {
        var path, element;
        for (path in M.editor_atto.widgets) {
            element = M.editor_atto.get_toolbar_node(elementid).one('.atto_' + path + '_button');

            if (element) {
                element.removeAttribute('disabled');
            }
        }
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
    add_toolbar_menu : function(elementid, plugin, iconurl, groupname, entries, buttonname, buttontitle, overlaywidth, menucolor) {
        var toolbar = M.editor_atto.get_toolbar_node(elementid),
            group = toolbar.one('.atto_group.' + groupname + '_group'),
            currentfocus,
            button,
            buttonpath,
            expimgurl;

        if (buttonname) {
            buttonpath = plugin + '_' + buttonname;
        } else {
            buttonname = '';
            buttonpath = plugin;
        }

        if (!buttontitle) {
            buttontitle = M.util.get_string('pluginname', 'atto_' + plugin);
        }

        if ((typeof overlaywidth) === 'undefined') {
            overlaywidth = '14';
        }
        if ((typeof menucolor) === 'undefined') {
            menucolor = 'transparent';
        }

        if (!group) {
            group = Y.Node.create('<div class="atto_group ' + groupname + '_group"></div>');
            toolbar.append(group);
        }
        expimgurl = M.util.image_url('t/expanded', 'moodle');
        button = Y.Node.create('<button class="atto_' + buttonpath + '_button atto_hasmenu" ' +
                                    'data-editor="' + Y.Escape.html(elementid) + '" ' +
                                    'tabindex="-1" ' +
                                    'type="button" ' +
                                    'data-menu="' + buttonpath + '_' + elementid + '" ' +
                                    'title="' + Y.Escape.html(buttontitle) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" '+
                                    'style="background-color:' + menucolor + ';" src="' + iconurl + '"/>' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + expimgurl + '"/>' +
                                    '</button>');

        group.append(button);

        currentfocus = toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // Save the name of the plugin.
        M.editor_atto.widgets[buttonpath] = buttonpath;

        var menu = Y.Node.create('<div class="atto_' + buttonpath + '_menu' +
                                 ' atto_menu" data-editor="' + Y.Escape.html(elementid) + '"' +
                                 ' style="min-width:' + (overlaywidth-2) + 'em"' +
                                 '"></div>');
        var i = 0, entry = {};

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            var insidemenu = Y.Node.create('<div tabindex="-1" class="atto_menuentry">' +
                '<a href="#" class="atto_' + buttonpath + '_action_' + i + '" ' +
                'data-editor="' + Y.Escape.html(elementid) + '" ' +
                'data-plugin="' + Y.Escape.html(plugin) + '" ' +
                'data-button="' + Y.Escape.html(buttonname) + '" ' +
                'data-handler="' + Y.Escape.html(buttonpath + '_action_' + i) + '">' +
                entry.text +
                '</a>' +
                '</div>');
            insidemenu.on("keydown", M.editor_atto.menu_item_arrow_key_handler, null, button);
            menu.append(insidemenu);
            if (!M.editor_atto.buttonhandlers[plugin + '_action_' + i]) {
                Y.one('body').delegate('click', M.editor_atto.buttonclicked_handler, '.atto_' + buttonpath + '_action_' + i);
                // Activate the link on space or enter.
                Y.one('body').delegate('key', M.editor_atto.buttonclicked_handler, '32,enter', '.atto_' + buttonpath + '_action_' + i);
                M.editor_atto.buttonhandlers[buttonpath + '_action_' + i] = entry.handler;
            }
        }

        if (!M.editor_atto.buttonhandlers[buttonpath]) {
            Y.one('body').delegate('click', M.editor_atto.showhide_menu_handler, '.atto_' + buttonpath + '_button');
            M.editor_atto.buttonhandlers[buttonpath] = true;
        }

        var overlay = new M.core.dialogue({
            bodyContent : menu,
            visible : false,
            width: overlaywidth + 'em',
            closeButton: false,
            center : false,
            render: true
        });

        M.editor_atto.menus[buttonpath + '_' + elementid] = overlay;
        overlay.align(button, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
        overlay.headerNode.hide();
    },

    /**
     * Handle arrow key on the menu items.
     *
     * @param event e the key event.
     * @param Y.Node the button calling the menu..
     */
    menu_item_arrow_key_handler : function(e, button) {
        var siblings;

        // Intercept the down and left keys.
        if (e.keyCode === 40 || e.keyCode === 37) {
            e.preventDefault();
            var nextsibling = e.currentTarget.get('nextSibling');

            // If no next sibling the we are the last sibling, go to the first one.
            if(nextsibling === null) {
                siblings = e.currentTarget.siblings();
                nextsibling = siblings.item(0);
            }

            nextsibling.get('firstChild').focus();
        } else if (e.keyCode === 38 || e.keyCode === 39) {
            // Intercept the up and right keys.
            e.preventDefault();
            var previoussibling = e.currentTarget.get('previousSibling');

            // If no preious sibling the we are the first sibling, go to the last one.
            if(previoussibling === null) {
                siblings = e.currentTarget.siblings();
                previoussibling = siblings.item(siblings.size() - 1);
            }

            previoussibling.get('firstChild').focus();
        } else if (e.keyCode === 9 || e.keyCode === 27) {
            // On the tab or esc key we close the menu.
            e.preventDefault();
            var overlay = M.editor_atto.menus[button.getAttribute('data-menu')];
            var menu = overlay.get('bodyContent');
            overlay.hide();
            menu.detach('clickoutside');
            // Put back the focus on the button.
            button.focus();

        }
    },

    /**
     * Add a button to the toolbar belonging to the editor for element with id "elementid".
     * @param string elementid - the id of the textarea we created this editor from.
     * @param string plugin - the plugin defining the button.
     * @param string icon - the url to the image for the icon
     * @param string groupname - the group the button should be appended to.
     * @handler function handler- A function to call when the button is clicked.
     * @param string buttonname - (optional) a name for the button. Required if a plugin creates more than one button.
     * @param string buttontitle - (optional) a title for the button. Required if a plugin creates more than one button.
     */
    add_toolbar_button : function(elementid, plugin, iconurl, groupname, handler, buttonname, buttontitle) {
        var toolbar = M.editor_atto.get_toolbar_node(elementid),
            group = toolbar.one('.atto_group.' + groupname + '_group'),
            button,
            buttonpath,
            currentfocus;

        if (buttonname) {
            buttonpath = plugin + '_' + buttonname;
        } else {
            buttonname = '';
            buttonpath = plugin;
        }

        if (!buttontitle) {
            buttontitle = M.util.get_string('pluginname', 'atto_' + plugin);
        }

        if (!group) {
            group = Y.Node.create('<div class="atto_group ' + groupname +'_group"></div>');
            toolbar.append(group);
        }
        button = Y.Node.create('<button class="atto_' + buttonpath + '_button" ' +
                               'data-editor="' + Y.Escape.html(elementid) + '" ' +
                               'data-plugin="' + Y.Escape.html(plugin) + '" ' +
                               'data-button="' + Y.Escape.html(buttonname) + '" ' +
                               'tabindex="-1" ' +
                               'data-handler="' + Y.Escape.html(buttonpath) + '" ' +
                               'title="' + Y.Escape.html(buttontitle) + '">' +
                                    '<img class="icon" aria-hidden="true" role="presentation" width="16" height="16" src="' + iconurl + '"/>' +
                               '</button>');

        group.append(button);

        currentfocus = toolbar.getAttribute('aria-activedescendant');
        if (!currentfocus) {
            // Initially set the first button in the toolbar to be the default on keyboard focus.
            button.setAttribute('tabindex', '0');
            toolbar.setAttribute('aria-activedescendant', button.generateID());
        }

        // We only need to attach this once.
        if (!M.editor_atto.buttonhandlers[buttonpath]) {
            Y.one('body').delegate('click', M.editor_atto.buttonclicked_handler, '.atto_' + buttonpath + '_button');
            M.editor_atto.buttonhandlers[buttonpath] = handler;
        }

        // Save the name of the plugin.
        M.editor_atto.widgets[buttonpath] = buttonpath;

    },

    /**
     * Implement arrow key navigation for the buttons in the toolbar.
     * @param Event e - the keyboard event.
     * @param string elementid - the id of the textarea we created this editor from.
     */
    keyboard_navigation : function(e, elementid) {
        var buttons,
            current,
            currentid,
            currentindex,
            toolbar = M.editor_atto.get_toolbar_node(elementid);

        e.preventDefault();

        // This workaround is because we cannot do ".atto_group:not([hidden]) button" in ie8 (even with selector-css3).
        // Create an empty NodeList.
        buttons = toolbar.all('empty');
        toolbar.all('.atto_group').each(function(group) {
            if (!group.hasAttribute('hidden')) {
                // Append the visible buttons to the buttons list.
                buttons = buttons.concat(group.all('button'));
            }
        });
        // The currentid is the id of the previously selected button.
        currentid = toolbar.getAttribute('aria-activedescendant');
        if (!currentid) {
            return;
        }
        // We only ever want one button with a tabindex of 0.
        current = Y.one('#' + currentid);
        current.setAttribute('tabindex', '-1');

        currentindex = buttons.indexOf(current);

        if (e.keyCode === 37) {
            // Left
            currentindex--;
            if (currentindex < 0) {
                currentindex = buttons.size()-1;
            }
        } else {
            // Right
            currentindex++;
            if (currentindex >= buttons.size()) {
                currentindex = 0;
            }
        }
        // Currentindex has been updated to point to the new button.
        current = buttons.item(currentindex);
        current.setAttribute('tabindex', '0');
        current.focus();
        toolbar.setAttribute('aria-activedescendant', current.generateID());
    }
});
