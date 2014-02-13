function EditorPluginMenu() {
}

EditorPluginMenu.ATTRS = {
};
EditorPluginMenu.prototype = {

    /**
     * Add a button to the toolbar belonging to the editor for element with id "elementid".
     * @param string elementid - the id of the textarea we created this editor from.
     * @param string plugin - the plugin defining the button
     * @param string icon - the html used for the content of the button
     * @param string groupname - the group the button should be appended to.
     * @param array entries - List of menu entries with the string (entry.text) and the handlers (entry.handler).
     * @param int overlaywidth - the overlay width size in 'ems'.
     * @param string menucolor - menu icon background color
     */
    add_toolbar_menu : function(elementid, plugin, iconurl, groupname, entries, overlaywidth, menucolor) {
        var toolbar = this.get_toolbar_node(elementid),
            group = toolbar.one('.atto_group.' + groupname + '_group'),
            currentfocus,
            button,
            expimgurl;

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
        button = Y.Node.create('<button class="atto_' + plugin + '_button atto_hasmenu" ' +
                                    'data-editor="' + Y.Escape.html(elementid) + '" ' +
                                    'tabindex="-1" ' +
                                    'type="button" ' +
                                    'data-menu="' + plugin + '_' + elementid + '" ' +
                                    'title="' + Y.Escape.html(M.util.get_string('pluginname', 'atto_' + plugin)) + '">' +
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
        this.widgets[plugin] = plugin;

        var menu = Y.Node.create('<div class="atto_' + plugin + '_menu' +
                                 ' atto_menu" data-editor="' + Y.Escape.html(elementid) + '"' +
                                 ' style="min-width:' + (overlaywidth-2) + 'em"' +
                                 '"></div>');
        var i = 0, entry = {};

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];

            menu.append(Y.Node.create('<div class="atto_menuentry">' +
                                       '<a href="#" class="atto_' + plugin + '_action_' + i + '" ' +
                                       'data-editor="' + Y.Escape.html(elementid) + '" ' +
                                       'data-plugin="' + Y.Escape.html(plugin) + '" ' +
                                       'data-handler="' + Y.Escape.html(plugin + '_action_' + i) + '">' +
                                       entry.text +
                                       '</a>' +
                                       '</div>'));
            if (!this.buttonhandlers[plugin + '_action_' + i]) {
                Y.one('body').delegate('click', this.buttonclicked_handler, '.atto_' + plugin + '_action_' + i);
                Y.one('body').delegate('key', this.buttonclicked_handler, 'space,enter', '.atto_' + plugin + '_action_' + i);
                this.buttonhandlers[plugin + '_action_' + i] = entry.handler;
            }
        }

        if (!this.buttonhandlers[plugin]) {
            Y.one('body').delegate('click', this.showhide_menu_handler, '.atto_' + plugin + '_button');
            this.buttonhandlers[plugin] = true;
        }

        var overlay = new M.core.dialogue({
            bodyContent : menu,
            visible : false,
            width: overlaywidth + 'em',
            lightbox: false,
            closeButton: false,
            center : false
        });

        this.menus[plugin + '_' + elementid] = overlay;
        overlay.align(button, [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BL]);
        overlay.hide();
        overlay.headerNode.hide();
        overlay.render();
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
    },

    /**
     * Toggle a menu.
     * @param event e
     */
    showhide_menu_handler : function(e) {
        e.preventDefault();
        var disabled = this.getAttribute('disabled');
        var overlayid = this.getAttribute('data-menu');
        var overlay = this.menus[overlayid];
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
        var handler = this.getAttribute('data-handler');
        var overlay = this.menus[plugin + '_' + elementid];
        var toolbar = this.get_toolbar_node(elementid);
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

        if (this.isEnabled(elementid, plugin)) {
            // Pass it on.
            handler = this.buttonhandlers[handler];
            return handler(e, elementid);
        }
    },

};

Y.namespace('M.editor_atto').EditorPluginMenu = EditorPluginMenu;
